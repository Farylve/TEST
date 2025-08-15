import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { requireDatabase } from '../middleware/databaseCheck';

const router = Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const userIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

const updateUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// User profile routes - all require database
router.get('/profile', requireDatabase, getProfile);
router.put('/profile', requireDatabase, updateProfileValidation, validateRequest, updateProfile);
router.put('/change-password', requireDatabase, changePasswordValidation, validateRequest, changePassword);
router.delete('/account', requireDatabase, deleteAccount);

// Admin routes - all require database
router.get('/', requireDatabase, authorize('ADMIN'), getAllUsers);
router.get('/:id', requireDatabase, authorize('ADMIN'), userIdValidation, validateRequest, getUserById);
router.put('/:id', requireDatabase, authorize('ADMIN'), updateUserValidation, validateRequest, updateUser);
router.delete('/:id', requireDatabase, authorize('ADMIN'), userIdValidation, validateRequest, deleteUser);

export default router;