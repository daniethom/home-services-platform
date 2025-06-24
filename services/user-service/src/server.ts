import app from './app';
import { logger } from './utils/logger';
import pool from './utils/database';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 User Service running on port ${PORT}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

startServer();
