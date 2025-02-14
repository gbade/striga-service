import mongoose from 'mongoose';
import { config } from '@app/config';
import { logger } from '@app/utils/logger';
import { initializeWebSocket } from './handlers/internal/websocket/server';
import { app } from '@api/app';

const startServer = async () => {
  try {
    await mongoose.connect(config.db.url);
    logger.info('Connected to MongoDB');

    const server = app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
    });

    initializeWebSocket(server);

    return server;
  } catch (error) {
    logger.error('Could not start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export { startServer };
