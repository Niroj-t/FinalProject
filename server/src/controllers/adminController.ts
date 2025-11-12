import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Notification from '../models/Notification';

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    // Build query object
    const query: any = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('lastLogin');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin only
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get user's assignments and submissions count
    const assignmentsCount = await Assignment.countDocuments({ createdBy: id });
    const submissionsCount = await Submission.countDocuments({ submittedBy: id });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          assignmentsCount,
          submissionsCount
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin only
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, teacher, or admin'
      });
      return;
    }

    // Prevent admin from changing their own role
    if (req.user?.id === id && role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'Cannot change your own admin role'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Delete user and related data
    await User.findByIdAndDelete(id);
    
    // Optionally delete related assignments and submissions
    // await Assignment.deleteMany({ createdBy: id });
    // await Submission.deleteMany({ submittedBy: id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Admin only
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalNotifications = await Notification.countDocuments();

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentAssignments = await Assignment.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentSubmissions = await Submission.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Active assignments (not past due date)
    const activeAssignments = await Assignment.countDocuments({
      isActive: true,
      dueDate: { $gte: new Date() }
    });

    // Overdue assignments
    const overdueAssignments = await Assignment.countDocuments({
      isActive: true,
      dueDate: { $lt: new Date() }
    });

    // User activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsersLast30Days = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers,
          admins: totalAdmins,
          active: activeUsers,
          recent: recentUsers,
          activeLast30Days: activeUsersLast30Days
        },
        assignments: {
          total: totalAssignments,
          active: activeAssignments,
          overdue: overdueAssignments,
          recent: recentAssignments
        },
        submissions: {
          total: totalSubmissions,
          recent: recentSubmissions
        },
        notifications: {
          total: totalNotifications
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all assignments with admin view
// @route   GET /api/admin/assignments
// @access  Admin only
export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string; // 'active', 'overdue', 'all'

    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
      query.dueDate = { $gte: new Date() };
    } else if (status === 'overdue') {
      query.isActive = true;
      query.dueDate = { $lt: new Date() };
    }

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all submissions with admin view
// @route   GET /api/admin/submissions
// @access  Admin only
export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string; // supports 'submitted' | 'late' | 'all'

    const query: any = {};
    
    // The Submission schema tracks status as 'submitted' | 'late'
    if (status === 'submitted' || status === 'late') {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('assignmentId', 'title dueDate')
      .populate('studentId', 'name email role')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(query);

    // Map to legacy field names expected by client: assignment, submittedBy
    const mapped = submissions.map((s: any) => ({
      _id: s._id,
      assignment: s.assignmentId,
      submittedBy: s.studentId,
      submittedAt: s.submittedAt,
      status: s.status,
      feedback: s.feedback,
    files: s.files,
    text: s.text,
    similarityReport: s.similarityReport ?? {
      score: 0,
      category: 'none',
      matches: []
    }
    }));

    res.json({
      success: true,
      data: {
        submissions: mapped,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create admin user
// @route   POST /api/admin/users
// @access  Admin only
export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get system logs/activity (placeholder for future implementation)
// @route   GET /api/admin/logs
// @access  Admin only
export const getSystemLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    // This is a placeholder for future logging implementation
    // For now, return recent user activity
    const recentUsers = await User.find()
      .select('name email role lastLogin createdAt')
      .sort({ lastLogin: -1 })
      .limit(20);

    res.json({
      success: true,
      message: 'System logs endpoint - placeholder implementation',
      data: {
        logs: recentUsers.map(user => ({
          type: 'user_activity',
          message: `${user.name} (${user.role}) last active: ${user.lastLogin ? new Date(user.lastLogin).toISOString() : 'Never'}`,
          timestamp: user.lastLogin || user.createdAt,
          user: {
            name: user.name,
            email: user.email,
            role: user.role
          }
        }))
      }
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
