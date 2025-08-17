import { Router } from 'express';
import { query, param } from 'express-validator';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
} from '../controllers/postController';
import { validateRequest } from '../middleware/validation';
import { requireDatabase } from '../middleware/databaseCheck';

const router = Router();

// Validation rules
const getPostsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isString()
    .trim()
    .withMessage('Category must be a string'),
  query('tag')
    .optional()
    .isString()
    .trim()
    .withMessage('Tag must be a string'),
  query('search')
    .optional()
    .isString()
    .trim()
    .withMessage('Search must be a string'),
];

const postIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid post ID format'),
];

const postSlugValidation = [
  param('slug')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Post slug is required'),
];

// Routes - all require database
router.get('/', requireDatabase, getPostsValidation, validateRequest, getAllPosts);
router.get('/id/:id', requireDatabase, postIdValidation, validateRequest, getPostById);
router.get('/slug/:slug', requireDatabase, postSlugValidation, validateRequest, getPostBySlug);

export default router;