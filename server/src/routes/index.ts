import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import postRoutes from './posts';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);

// Protected routes
router.use('/users', authenticate, userRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'Portfolio API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      health: '/health',
    },
  });
});

export default router;