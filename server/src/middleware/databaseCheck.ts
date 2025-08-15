import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/database';
import { logger } from '../utils/logger';

/**
 * Middleware to check database availability before operations
 * If database is not available, returns appropriate error response
 */
export const requireDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isConnected = await databaseService.checkConnection();
    
    if (!isConnected) {
      logger.warn(`Database unavailable for ${req.method} ${req.path}`);
      
      res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please try again later.',
        error: 'DATABASE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Add prisma client to request for use in routes
    const prismaClient = databaseService.getPrismaClient();
    if (prismaClient) {
      (req as any).prisma = prismaClient;
    }
    
    next();
  } catch (error) {
    logger.error('Database check middleware error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during database check',
      error: 'DATABASE_CHECK_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to check database availability but continue if not available
 * Adds database status to request object
 */
export const checkDatabase = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isConnected = await databaseService.checkConnection();
    const prismaClient = databaseService.getPrismaClient();
    
    // Add database info to request
    (req as any).database = {
      isConnected,
      prisma: isConnected ? prismaClient : null
    };
    
    if (!isConnected) {
      logger.warn(`Database unavailable for ${req.method} ${req.path} - continuing with limited functionality`);
    }
    
    next();
  } catch (error) {
    logger.error('Database check middleware error:', error);
    
    // Continue with no database
    (req as any).database = {
      isConnected: false,
      prisma: null
    };
    
    next();
  }
};

/**
 * Middleware to add database reconnection endpoint
 */
export const handleDatabaseReconnect = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info('Manual database reconnection requested');
    
    const reconnected = await databaseService.forceReconnect();
    
    if (reconnected) {
      res.status(200).json({
        success: true,
        message: 'Database reconnected successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Failed to reconnect to database',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Database reconnection error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error during database reconnection attempt',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Type augmentation for Request object
declare global {
  namespace Express {
    interface Request {
      database?: {
        isConnected: boolean;
        prisma: any | null;
      };
      prisma?: any;
    }
  }
}