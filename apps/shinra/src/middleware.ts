import { Request, Response, NextFunction } from 'express';
import { cors as honoCors } from 'hono/cors';
import pino from 'pino';
import { SERVER, PROXY, LOGGING } from './config/constants.js';

// ==================== LOGGER MIDDLEWARE ====================

// Create a pino logger instance
export const logger = pino.default({
  level: LOGGING.LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

/**
 * Request logger middleware for Express
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || 
                    Math.random().toString(36).substring(2);
  
  // Add request ID to response headers
  res.setHeader('x-request-id', requestId);
  
  // Log request start
  const requestLog = {
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: getFilteredHeaders(req),
    remoteAddress: req.ip || req.socket.remoteAddress || 'unknown',
  };
  
  logger.debug({ type: 'request', ...requestLog }, 'Request received');
  
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method to log response
  // @ts-ignore - Need to override the function
  res.end = function(chunk: any, encoding: BufferEncoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log the response
    const logData = {
      type: 'response',
      requestId,
      method: req.method,
      url: req.url,
      path: req.path,
      status: res.statusCode,
      responseTime,
    };
    
    const message = `Response sent: ${res.statusCode} (${responseTime}ms)`;
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(logData, message);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, message);
    } else {
      logger.info(logData, message);
    }
    
    // Call the original end method
    return originalEnd.apply(res, arguments as any);
  };
  
  next();
};

/**
 * Get filtered headers to avoid logging sensitive information
 */
function getFilteredHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
  
  for (const [key, value] of Object.entries(req.headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      headers[key] = '[REDACTED]';
    } else {
      headers[key] = Array.isArray(value) ? value.join(', ') : (value || '');
    }
  }
  
  return headers;
}


// ==================== CORS MIDDLEWARE ====================

/**
 * Convert Hono middleware to Express middleware
 */
const honoAdapter = (middleware: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Create a simplified Hono-like context
    const c = {
      req: {
        raw: req,
        header: (name: string) => req.headers[name.toLowerCase()] as string,
        method: req.method,
        url: req.url,
      },
      res: {
        headers: new Headers(),
        status: (code: number) => {
          res.status(code);
          return c;
        },
        body: (body: any) => {
          return c;
        },
      },
      header: (name: string, value: string) => {
        res.setHeader(name, value);
        return c;
      },
    };

    try {
      // Execute the Hono middleware
      const result = await middleware(c, async () => {});
      
      // If the middleware returned a response, we need to handle it
      if (result !== undefined) {
        // For simple CORS preflight OPTIONS requests
        if (req.method === 'OPTIONS') {
          res.status(204).end();
          return;
        }
      }
      
      // Continue to the next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * CORS middleware using Hono's CORS implementation
 */
export const corsMiddleware = honoAdapter(
  honoCors({
    origin: PROXY.ALLOWED_ORIGINS.includes('*') 
      ? '*' 
      : PROXY.ALLOWED_ORIGINS,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Range'],
    exposeHeaders: ['Content-Length', 'Content-Range', 'Content-Type', 'Accept-Ranges'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// ==================== ERROR HANDLER MIDDLEWARE ====================

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: {
    code: number;
    message: string;
    details?: any;
  };
  success: false;
  timestamp: string;
  path?: string;
}

/**
 * Global error handler middleware for Express
 */
export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Extract error details
  let statusCode = err.status || err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';
  let errorDetails: any = undefined;
  
  // Log the error
  logger.error({
    error: err instanceof Error ? err : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
    url: req.url,
  }, 'Request error');
  
  // Add error details in development mode
  if (!SERVER.IS_PRODUCTION) {
    errorDetails = {
      name: err.name,
      stack: err.stack,
    };
  }
  
  // Create the error response
  const errorResponse: ErrorResponse = {
    error: {
      code: statusCode,
      message: errorMessage,
      ...(errorDetails ? { details: errorDetails } : {}),
    },
    success: false,
    timestamp: new Date().toISOString(),
    path: req.path,
  };
  
  // Send the error response
  res.status(statusCode).json(errorResponse);
};

// ==================== EXPORTS ====================

export default {
  logger,
  requestLogger,
  corsMiddleware,
  errorHandler
};