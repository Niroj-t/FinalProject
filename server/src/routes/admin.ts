import express from 'express';
import { body } from 'express-validator';
import { authenticateJWT } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getSystemStats,
  getAllAssignments,
  getAllSubmissions,
  createAdminUser,
  getSystemLogs
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

// Validation middleware
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be either student, teacher, or admin')
];

const updateRoleValidation = [
  body('role')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be either student, teacher, or admin')
];

const updateStatusValidation = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// ===================
// USER MANAGEMENT ROUTES
// ===================

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin only
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID with additional info
// @access  Admin only
router.get('/users/:id', getUserById);

// @route   POST /api/admin/users
// @desc    Create new user (admin can create any role)
// @access  Admin only
router.post('/users', createUserValidation, createAdminUser);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Admin only
router.put('/users/:id/status', updateStatusValidation, updateUserStatus);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', updateRoleValidation, updateUserRole);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', deleteUser);

// ===================
// SYSTEM STATISTICS ROUTES
// ===================

// @route   GET /api/admin/stats
// @desc    Get comprehensive system statistics
// @access  Admin only
router.get('/stats', getSystemStats);

// @route   GET /api/admin/logs
// @desc    Get system logs/activity
// @access  Admin only
router.get('/logs', getSystemLogs);

// ===================
// CONTENT MANAGEMENT ROUTES
// ===================

// @route   GET /api/admin/assignments
// @desc    Get all assignments with admin view
// @access  Admin only
router.get('/assignments', getAllAssignments);

// @route   GET /api/admin/submissions
// @desc    Get all submissions with admin view
// @access  Admin only
router.get('/submissions', getAllSubmissions);

// ===================
// HEALTH CHECK ROUTE
// ===================

// @route   GET /api/admin/health
// @desc    Admin panel health check
// @access  Admin only
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin panel is healthy',
    timestamp: new Date().toISOString(),
    user: {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role
    }
  });
});

export default router;
