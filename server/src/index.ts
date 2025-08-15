import dotenv from 'dotenv';
import { app } from './app';
import { logger } from './utils/logger';
import { databaseService } from './services/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOSTNAME || 'localhost';

// Start server
async function startServer() {
  try {
    // Try to connect to database (non-blocking)
    const dbConnected = await databaseService.connect();
    
    if (!dbConnected) {
      logger.warn('⚠️  Server starting without database connection. Some features may be limited.');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://${HOST}:${PORT}`);
      logger.info(`📚 API Documentation: http://${HOST}:${PORT}/api`);
      logger.info(`🏥 Health Check: http://${HOST}:${PORT}/api/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await databaseService.disconnect();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();