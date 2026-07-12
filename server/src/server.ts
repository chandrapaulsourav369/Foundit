import app from './app.ts';
import logger from './config/logger.ts';
import { connectDB } from './config/database.ts';

const PORT = process.env.PORT || 8000;
let isShuttingDown = false;

connectDB()
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch(err => {
    logger.error(`Failed to connect to MongoDB: ${String(err)}`);
  });

const server = app.listen(PORT, () => {
  console.log('start');
});

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}, shutting down API server`);

  const closeServer = () =>
    new Promise<void>((resolve, reject) => {
      server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

  try {
    await closeServer();
    logger.info('API server shut down cleanly');
    process.exit(0);
  } catch (err) {
    logger.error(`Shutdown failed: ${String(err)}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
