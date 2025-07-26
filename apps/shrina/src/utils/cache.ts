import NodeCache from 'node-cache';
import { logger } from '../middleware.js';

interface CacheOptions {
  stdTTL: number;        // Standard TTL in seconds
  checkperiod: number;   // Period in seconds to check for expired keys
  maxKeys: number;       // Maximum number of keys in cache
  useClones: boolean;    // Whether to use clones
}

// Parse environment variables
const CACHE_ENABLED = process.env.ENABLE_CACHE === 'true';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10); // 5 minutes default
const CACHE_CHECK_PERIOD = parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10); // 10 minutes
const CACHE_MAX_KEYS = parseInt(process.env.CACHE_MAX_SIZE || '1000', 10);
const CACHE_SIZE = parseInt(process.env.CACHE_SIZE || '104857600', 10); // 100MB default

// Create cache options
const cacheOptions: CacheOptions = {
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_CHECK_PERIOD,
  maxKeys: CACHE_MAX_KEYS,
  useClones: false // to save memory for large objects
};

// Initialize the cache
const cache = new NodeCache(cacheOptions);
let currentCacheSize = 0;

// Track cache stats
let cacheHits = 0;
let cacheMisses = 0;

// Generate cache key from URL and request headers that might affect response
export function generateCacheKey(url: string, headers: Record<string, any> = {}): string {
  // Extract relevant headers that might affect the response
  const relevantHeaders: Record<string, any> = {};
  const headersToInclude = ['range', 'accept', 'accept-encoding'];
  
  headersToInclude.forEach(header => {
    if (headers[header]) {
      relevantHeaders[header] = headers[header];
    }
  });
  
  return `${url}|${JSON.stringify(relevantHeaders)}`;
}

// Set item in cache with size tracking
export function setCacheItem(key: string, value: any, size: number): boolean {
  if (!CACHE_ENABLED) return false;
  
  // Check if adding this item would exceed cache size limit
  if (currentCacheSize + size > CACHE_SIZE) {
    // Implement a simple LRU-like cleanup
    const keys = cache.keys();
    if (keys.length > 0) {
      // Sort keys by TTL - remove items closest to expiration
      const keysToRemove = keys.slice(0, Math.ceil(keys.length * 0.2)); // Remove 20% of items
      keysToRemove.forEach(k => {
        const item = cache.get<{data: Buffer, size: number}>(k);
        if (item) {
          currentCacheSize -= item.size;
          cache.del(k);
        }
      });
      
      logger.debug({
        type: 'cache',
        action: 'cleanup',
        removed: keysToRemove.length,
        newSize: formatBytes(currentCacheSize),
        limit: formatBytes(CACHE_SIZE)
      }, 'Cache cleanup performed');
    }
    
    // If still not enough space, don't cache this item
    if (currentCacheSize + size > CACHE_SIZE) {
      logger.debug({
        type: 'cache',
        action: 'skip',
        reason: 'size_limit',
        itemSize: formatBytes(size),
        currentSize: formatBytes(currentCacheSize),
        limit: formatBytes(CACHE_SIZE)
      }, 'Item too large to cache');
      return false;
    }
  }
  
  // Add to cache and update size tracker
  const success = cache.set(key, { data: value, size });
  if (success) {
    currentCacheSize += size;
    logger.debug({
      type: 'cache',
      action: 'set',
      key: key.substring(0, 50), // Truncate long keys in logs
      size: formatBytes(size),
      totalSize: formatBytes(currentCacheSize)
    }, 'Item added to cache');
  }
  
  return success;
}

// Get item from cache
export function getCacheItem(key: string): { data: Buffer, size: number } | undefined {
  if (!CACHE_ENABLED) return undefined;
  
  const item = cache.get<{ data: Buffer, size: number }>(key);
  if (item) {
    cacheHits++;
    logger.debug({
      type: 'cache',
      action: 'hit',
      key: key.substring(0, 50),
      hitRatio: (cacheHits / (cacheHits + cacheMisses)).toFixed(2)
    }, 'Cache hit');
    return item;
  } else {
    cacheMisses++;
    logger.debug({
      type: 'cache',
      action: 'miss',
      key: key.substring(0, 50),
      hitRatio: (cacheHits / (cacheHits + cacheMisses)).toFixed(2)
    }, 'Cache miss');
    return undefined;
  }
}

// Helper to format bytes to human-readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get cache stats
export function getCacheStats() {
  return {
    enabled: CACHE_ENABLED,
    size: formatBytes(currentCacheSize),
    maxSize: formatBytes(CACHE_SIZE),
    items: cache.keys().length,
    maxItems: CACHE_MAX_KEYS,
    hitRatio: cacheHits + cacheMisses > 0 ? 
      (cacheHits / (cacheHits + cacheMisses)).toFixed(2) : '0.00',
    hits: cacheHits,
    misses: cacheMisses
  };
}

// Clear cache
export function clearCache() {
  cache.flushAll();
  currentCacheSize = 0;
  logger.info({
    type: 'cache',
    action: 'clear'
  }, 'Cache cleared');
  return true;
}

export default {
  generateCacheKey,
  setCacheItem,
  getCacheItem,
  getCacheStats,
  clearCache,
  CACHE_ENABLED
};