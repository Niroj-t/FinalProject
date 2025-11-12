import express from 'express';
import { body } from 'express-validator';
import { authenticateJWT } from '../middleware/auth';
import { changePassword } from '../controllers/userController';

const router = express.Router();

const changePasswordValidation = [
  body('currentPassword')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isString()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

router.put('/change-password', authenticateJWT, changePasswordValidation, changePassword);

export default router;


