import express from 'express';
import { body } from 'express-validator';
import { authenticateJWT, requireTeacher } from '../middleware/auth';
import { uploadMultiple } from '../utils/fileUpload';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController';

const router = express.Router();

// Validation middleware
const assignmentValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Instructions cannot exceed 2000 characters')
];

// Routes
router.get('/', authenticateJWT, getAssignments);
router.get('/:id', authenticateJWT, getAssignment);
router.post('/', authenticateJWT, requireTeacher, uploadMultiple, assignmentValidation, createAssignment);
router.put('/:id', authenticateJWT, requireTeacher, uploadMultiple, assignmentValidation, updateAssignment);
router.delete('/:id', authenticateJWT, requireTeacher, deleteAssignment);

export default router;