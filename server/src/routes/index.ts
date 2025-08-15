import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', authenticate, userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Portfolio API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/health',
    },
  });
});

export default router;