import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Server configuration
 */
export const SERVER = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || 'localhost',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

/**
 * Proxy settings
 */
export const PROXY = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  MAX_REQUEST_SIZE: parseInt(process.env.MAX_REQUEST_SIZE || '10485760', 10), // 10MB
  ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS?.split(',').filter(Boolean) || [],
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30 seconds
  ENABLE_DOMAIN_WHITELIST: process.env.ENABLE_DOMAIN_WHITELIST === 'true',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING === 'true',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10), // 60 per minute
};

/**
 * Logging configuration
 */
export const LOGGING = {
  LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * Route paths
 */
export const ROUTES = {
  PROXY_BASE: '/proxy',
  PROXY_PATH: '/proxy/:url',
  PROXY_BASE64: '/proxy-base64/:encodedUrl',
};

/**
 * Common HTTP headers
 */
export const HEADERS = {
  // CORS related headers
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Content-Security-Policy': "default-src 'self'",
  },
};

export default {
  SERVER,
  PROXY,
  LOGGING,
  ROUTES,
  HEADERS,
};