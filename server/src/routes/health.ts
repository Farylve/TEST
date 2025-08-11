import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    memory: {
      used: string;
      total: string;
      percentage: string;
    };
  };
}

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let databaseStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      logger.error('Database health check failed:', error);
      databaseStatus = 'error';
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

    const healthStatus: HealthStatus = {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: databaseStatus,
        memory: {
          used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
          total: `${Math.round(totalMemory / 1024 / 1024)}MB`,
          percentage: `${memoryPercentage}%`,
        },
      },
    };

    const responseTime = Date.now() - startTime;
    
    // Set response headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Response-Time': `${responseTime}ms`,
    });

    // Return appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      data: healthStatus,
    });

  } catch (error) {
    logger.error('Health check endpoint error:', error);
    
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
      },
    });
  }
});

/**
 * @route GET /api/health/ready
 * @desc Readiness probe endpoint
 * @access Public
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route GET /api/health/live
 * @desc Liveness probe endpoint
 * @access Public
 */
router.get('/live', (_req: Request, res: Response) => {
  // Simple liveness check - if the server can respond, it's alive
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;