import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Assignment from '../models/Assignment';
import User from '../models/User';

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = { isActive: true };

    // Filter by status
    if (status === 'active') {
      query.dueDate = { $gt: new Date() };
    } else if (status === 'overdue') {
      query.dueDate = { $lt: new Date() };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    }

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Assignment.countDocuments(query);

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasNext: skip + assignments.length < total,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { assignment }
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Teachers only)
export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { title, description, dueDate, instructions, attachments } = req.body;

    // Validate due date
    if (new Date(dueDate) <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Due date must be in the future'
      });
      return;
    }

    // Get file paths from uploaded files
    const files = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      instructions,
      attachments: files.length > 0 ? files : attachments || [],
      createdBy: req.user.id
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment: populatedAssignment }
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teachers only)
export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
      return;
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own assignments.'
      });
      return;
    }

    const { title, description, dueDate, instructions, attachments } = req.body;

    // Validate due date if provided
    if (dueDate && new Date(dueDate) <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Due date must be in the future'
      });
      return;
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        dueDate,
        instructions,
        attachments: attachments || assignment.attachments
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment: updatedAssignment }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teachers only)
export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
      return;
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own assignments.'
      });
      return;
    }

    // Soft delete by setting isActive to false
    assignment.isActive = false;
    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};