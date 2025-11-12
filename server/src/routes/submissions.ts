import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { uploadMultiple } from '../utils/fileUpload';
import { 
  getSubmissionsByAssignment, 
  getMySubmissions, 
  submitAssignment, 
  updateSubmission,
  getFlaggedSubmissions
} from '../controllers/submissionController';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const submissionValidation = [
  body('text').optional().trim().isLength({ min: 1 }).withMessage('Text cannot be empty'),
  body('files').optional().isArray().withMessage('Files must be an array')
];

// Routes
router.get('/assignment/:assignmentId/flags', authenticateJWT, getFlaggedSubmissions);
router.get('/assignment/:assignmentId', authenticateJWT, getSubmissionsByAssignment);
router.get('/my', authenticateJWT, getMySubmissions);
// Use upload middleware so multipart/form-data fields (including assignmentId) are parsed
router.post('/', authenticateJWT, uploadMultiple, submissionValidation, submitAssignment);
router.put('/:id', authenticateJWT, uploadMultiple, submissionValidation, updateSubmission);

export default router;