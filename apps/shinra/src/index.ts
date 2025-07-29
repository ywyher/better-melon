import http from 'http';
import 'dotenv/config';
import app from './app.js';
import { SERVER } from './config/constants.js';
import { logger } from './middleware.js';

// Get port from environment
const PORT = process.env.PORT || 3000;
const USE_CLOUDFLARE = process.env.USE_CLOUDFLARE === 'true';

// Create regular HTTP server since Cloudflare will handle HTTP/2
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  logger.info(
    {
      type: 'server',
      port: PORT,
      env: SERVER.NODE_ENV,
      cloudflare: USE_CLOUDFLARE
    },
    `Server is running on http://localhost:${PORT}`
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});


// Handle server errors
server.on('error', (err) => {
  logger.error(
    {
      type: 'server',
      error: err instanceof Error ? err : String(err),
    },
    'Server error'
  );

  // Exit on critical errors
  process.exit(1);
});

// Handle graceful shutdown
const signals = ['SIGINT', 'SIGTERM'] as const;

signals.forEach((signal) => {
  process.on(signal, () => {
    logger.info(
      {
        type: 'server',
        signal,
      },
      'Shutting down server'
    );

    server.close(() => {
      logger.info(
        {
          type: 'server',
        },
        'Server closed'
      );
      process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
      logger.error(
        {
          type: 'server',
        },
        'Server failed to close gracefully, forcing exit'
      );
      process.exit(1);
    }, 10000).unref();
  });
});

export default server;