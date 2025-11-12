import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Submission from '../models/Submission';
import Assignment from '../models/Assignment';
import Notification from '../models/Notification';
import { extractSubmissionText, normalizeText, createContentHash, buildSimilarityReport, bucketScore } from '../utils/plagiarism';

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private
export const getSubmissionsByAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
      return;
    }

    // Check permissions
    if (req.user.role === 'student' && assignment.createdBy.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const query: any = { assignmentId: req.params.assignmentId };
    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: {
        submissions,
        assignment: {
          id: assignment._id,
          title: assignment.title,
          dueDate: assignment.dueDate
        },
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasNext: skip + submissions.length < total,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get flagged submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId/flags
// @access  Private (Teachers/Admins)
export const getFlaggedSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
      return;
    }

    if (req.user.role === 'student') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    if (req.user.role === 'teacher' && assignment.createdBy.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const flagged = await Submission.find({
      assignmentId: assignment._id,
      'similarityReport.category': { $in: ['medium', 'high'] }
    })
      .select('studentId files submittedAt similarityReport')
      .populate('studentId', 'name email')
      .sort({ 'similarityReport.score': -1 })
      .lean();

    const matchIds = new Set<string>();
    flagged.forEach(sub => {
      sub.similarityReport?.matches?.forEach(match => {
        matchIds.add(match.submissionId.toString());
      });
    });

    const matchedSubmissions = await Submission.find({
      _id: { $in: Array.from(matchIds) }
    })
      .select('studentId similarityReport.score')
      .populate('studentId', 'name email')
      .lean();

    const matchMap = new Map<string, any>();
    matchedSubmissions.forEach(sub => {
      matchMap.set(sub._id.toString(), sub);
    });

    const result = flagged.map(sub => ({
      _id: sub._id,
      student: sub.studentId,
      files: sub.files,
      submittedAt: sub.submittedAt,
      similarityReport: {
        score: sub.similarityReport?.score ?? 0,
        category: sub.similarityReport?.category ?? 'none',
        matches: (sub.similarityReport?.matches ?? []).map(match => ({
          submissionId: match.submissionId,
          score: match.score,
          student: matchMap.get(match.submissionId.toString())?.studentId ?? null
        }))
      }
    }));

    res.json({
      success: true,
      data: {
        assignment: {
          id: assignment._id,
          title: assignment.title
        },
        submissions: result
      }
    });
  } catch (error) {
    console.error('Get flagged submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's submissions
// @route   GET /api/submissions/my
// @access  Private (Students only)
export const getMySubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const submissions = await Submission.find({ studentId: req.user.id })
      .populate('assignmentId', 'title dueDate')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Submission.countDocuments({ studentId: req.user.id });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasNext: skip + submissions.length < total,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private (Students only)
export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { assignmentId, text } = req.body;
    
    // Get file paths from uploaded files
    const files = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

    // Check if assignment exists and is active
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.isActive) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found or inactive'
      });
      return;
    }

    // Check if assignment is overdue
    if (new Date() > assignment.dueDate) {
      res.status(400).json({
        success: false,
        message: 'Assignment is overdue and cannot be submitted'
      });
      return;
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (existingSubmission) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
      return;
    }

    const providedText = typeof text === 'string' ? text : undefined;
    const extractedText = await extractSubmissionText(files, providedText);
    const normalizedText = normalizeText(extractedText ?? providedText);
    const contentHash = createContentHash(normalizedText);

    const peerSubmissions = await Submission.find({ assignmentId })
      .select('_id normalizedText contentHash')
      .lean<{ _id: mongoose.Types.ObjectId | string; normalizedText?: string; contentHash?: string }[]>();

    const report = buildSimilarityReport(
      normalizedText,
      contentHash,
      peerSubmissions
    );

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      text: providedText,
      files,
      extractedText,
      normalizedText,
      contentHash,
      similarityReport: {
        score: report.score,
        category: report.category,
        matches: report.matches
      },
      submittedAt: new Date()
    });

    const submissionId = submission.id;

    const submissionObjectId = new mongoose.Types.ObjectId(submissionId);

    if (report.matches.length > 0) {
      await Promise.all(report.matches.map(async match => {
        const peer = await Submission.findById(match.submissionId);
        if (!peer) return;

        const matches = peer.similarityReport?.matches ?? [];
        const existingIndex = matches.findIndex(existing => String(existing.submissionId) === submissionId);

        if (existingIndex >= 0) {
          matches[existingIndex].score = match.score;
        } else {
          matches.push({
            submissionId: submissionObjectId,
            score: match.score
          });
        }

        const newScore = Math.max(peer.similarityReport?.score ?? 0, match.score);
        peer.similarityReport = {
          score: newScore,
          category: bucketScore(newScore),
          matches
        };

        await peer.save();
      }));
    }

    if (report.score >= 0.8) {
      let matchedStudentName = 'another student';

      if (report.matches[0]) {
        const matchedSubmission = await Submission.findById(report.matches[0].submissionId)
          .populate('studentId', 'name');
        const matchedStudent = matchedSubmission?.studentId as any;
        if (matchedStudent?.name) {
          matchedStudentName = matchedStudent.name;
        }
      }

      // Notify teacher (only if assignment has a creator)
      if (assignment.createdBy) {
        await Notification.create({
          userId: assignment.createdBy,
          title: 'Similar submission detected',
          message: `${req.user.name} submitted work that is highly similar to ${matchedStudentName}.`,
          type: 'assignment',
          relatedId: submissionObjectId,
          relatedType: 'submission'
        });
      }

      // Always notify student about their own submission's similarity
      await Notification.create({
        userId: req.user.id,
        title: 'High similarity detected in your submission',
        message: `Your submission for "${assignment.title}" has ${Math.round(report.score * 100)}% similarity with ${matchedStudentName}'s work. Please review your submission.`,
        type: 'assignment',
        relatedId: submissionObjectId,
        relatedType: 'submission'
      });
    }

    const populatedSubmission = await Submission.findById(submissionObjectId)
      .populate('assignmentId', 'title dueDate')
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: { submission: populatedSubmission }
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private (Students only)
export const updateSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId', 'dueDate');

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
      return;
    }

    // Check ownership
    if (submission.studentId.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own submissions.'
      });
      return;
    }

    // Check if assignment is overdue - Fix: Cast to any to access populated fields
    const assignment = submission.assignmentId as any;
    if (new Date() > assignment.dueDate) {
      res.status(400).json({
        success: false,
        message: 'Cannot update submission after due date'
      });
      return;
    }

    const providedText = typeof req.body.text === 'string' ? req.body.text : submission.text;
    const submissionId = submission.id;
    const submissionObjectId = new mongoose.Types.ObjectId(submissionId);

    // Get file paths from uploaded files
    const newFiles = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];
    
    // Combine existing files with new files (or replace if new files are provided)
    const files = newFiles.length > 0 ? newFiles : submission.files || [];

    submission.files = files;
    submission.text = providedText;
    submission.submittedAt = new Date();

    const extractedText = await extractSubmissionText(files, providedText);
    const normalizedText = normalizeText(extractedText ?? providedText);
    const contentHash = createContentHash(normalizedText);

    const peerSubmissions = await Submission.find({
      assignmentId: submission.assignmentId,
      _id: { $ne: submissionObjectId }
    })
      .select('_id normalizedText contentHash')
      .lean<{ _id: mongoose.Types.ObjectId | string; normalizedText?: string; contentHash?: string }[]>();

    const report = buildSimilarityReport(
      normalizedText,
      contentHash,
      peerSubmissions
    );

    submission.extractedText = extractedText;
    submission.normalizedText = normalizedText;
    submission.contentHash = contentHash;
    submission.similarityReport = {
      score: report.score,
      category: report.category,
      matches: report.matches
    };

    await submission.save();

    if (report.matches.length > 0) {
      await Promise.all(report.matches.map(async match => {
        const peer = await Submission.findById(match.submissionId);
        if (!peer) return;

        const matches = peer.similarityReport?.matches ?? [];
        const existingIndex = matches.findIndex(existing => String(existing.submissionId) === submissionId);

        if (existingIndex >= 0) {
          matches[existingIndex].score = match.score;
        } else {
          matches.push({
            submissionId: submissionObjectId,
            score: match.score
          });
        }

        const newScore = Math.max(peer.similarityReport?.score ?? 0, match.score);
        peer.similarityReport = {
          score: newScore,
          category: bucketScore(newScore),
          matches
        };

        await peer.save();
      }));
    }

    if (report.score >= 0.8) {
      const assignmentDoc = await Assignment.findById(submission.assignmentId);

      let matchedStudentName = 'another student';

      if (report.matches[0]) {
        const matchedSubmission = await Submission.findById(report.matches[0].submissionId)
          .populate('studentId', 'name');
        const matchedStudent = matchedSubmission?.studentId as any;
        if (matchedStudent?.name) {
          matchedStudentName = matchedStudent.name;
        }
      }

      // Notify teacher (only if assignment has a creator)
      if (assignmentDoc?.createdBy) {
        await Notification.create({
          userId: assignmentDoc.createdBy,
          title: 'Similar submission updated',
          message: `${req.user.name} updated their submission and it remains highly similar to ${matchedStudentName}.`,
          type: 'assignment',
          relatedId: submissionObjectId,
          relatedType: 'submission'
        });
      }

      // Always notify student about their own submission's similarity
      await Notification.create({
        userId: req.user.id,
        title: 'High similarity detected in your updated submission',
        message: `Your updated submission for "${assignmentDoc?.title || 'the assignment'}" has ${Math.round(report.score * 100)}% similarity with ${matchedStudentName}'s work. Please review your submission.`,
        type: 'assignment',
        relatedId: submissionObjectId,
        relatedType: 'submission'
      });
    }

    const updatedSubmission = await Submission.findById(submissionObjectId)
      .populate('assignmentId', 'title dueDate')
      .populate('studentId', 'name email');

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission: updatedSubmission }
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};