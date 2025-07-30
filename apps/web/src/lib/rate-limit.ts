// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  limit: number;
};

export function rateLimit({ uniqueTokenPerInterval = 500, interval = 60000, limit }: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    check: (headers: Headers, token: string, tokensToConsume = 1) => {
      // Get the current tokens for this token
      const now = Date.now();
      
      // Initialize token bucket
      const tokenCount = tokenCache.get(token) || [];
      
      // Remove timestamps older than the current interval
      const validTokens = tokenCount.filter(timestamp => now - timestamp < interval);
      
      // Check if adding the requested tokens exceeds the limit
      if (validTokens.length + tokensToConsume > limit) {
        headers.set('Retry-After', `${Math.ceil(interval / 1000)}`);
        headers.set('X-RateLimit-Limit', `${limit}`);
        headers.set('X-RateLimit-Remaining', '0');
        headers.set('X-RateLimit-Reset', `${Math.ceil((now + interval) / 1000)}`);
        
        return Promise.reject(new Error('Rate limit exceeded'));
      }
      
      // Add current timestamp(s) to the token list
      const newTokens = [...validTokens];
      for (let i = 0; i < tokensToConsume; i++) {
        newTokens.push(now);
      }
      
      // Update cache
      tokenCache.set(token, newTokens);
      
      // Set rate limit headers
      headers.set('X-RateLimit-Limit', `${limit}`);
      headers.set('X-RateLimit-Remaining', `${limit - newTokens.length}`);
      
      return Promise.resolve();
    },
  };
}