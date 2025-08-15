import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class DatabaseService {
  private prisma: PrismaClient | null = null;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 seconds
  private retryTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializePrisma();
  }

  private initializePrisma(): void {
    try {
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty',
      });
    } catch (error) {
      logger.error('Failed to initialize Prisma client:', error);
      this.prisma = null;
    }
  }

  async connect(): Promise<boolean> {
    if (!this.prisma) {
      logger.warn('Prisma client not initialized');
      return false;
    }

    try {
      await this.prisma.$connect();
      await this.prisma.$queryRaw`SELECT 1`;
      this.isConnected = true;
      this.connectionAttempts = 0;
      logger.info('✅ Database connected successfully');
      return true;
    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;
      logger.error(`❌ Database connection failed (attempt ${this.connectionAttempts}/${this.maxRetries}):`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        logger.info(`Retrying database connection in ${this.retryDelay / 1000} seconds...`);
        this.scheduleRetry();
      } else {
        logger.error('Max database connection attempts reached. Server will continue without database.');
      }
      
      return false;
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    
    this.retryTimer = setTimeout(() => {
      this.connect();
    }, this.retryDelay);
  }

  async disconnect(): Promise<void> {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
        logger.info('Database disconnected successfully');
      } catch (error) {
        logger.error('Error disconnecting from database:', error);
      }
    }
    
    this.isConnected = false;
  }

  async checkConnection(): Promise<boolean> {
    if (!this.prisma || !this.isConnected) {
      return false;
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.warn('Database connection check failed:', error);
      this.isConnected = false;
      
      // Try to reconnect
      if (this.connectionAttempts < this.maxRetries) {
        this.connect();
      }
      
      return false;
    }
  }

  getPrismaClient(): PrismaClient | null {
    return this.isConnected ? this.prisma : null;
  }

  getConnectionStatus(): {
    isConnected: boolean;
    connectionAttempts: number;
    maxRetries: number;
  } {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxRetries: this.maxRetries,
    };
  }

  // Force reconnection attempt
  async forceReconnect(): Promise<boolean> {
    this.connectionAttempts = 0;
    return await this.connect();
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export { DatabaseService };