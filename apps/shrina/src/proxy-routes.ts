import express, { Request, Response, NextFunction, Router } from 'express';
import fetch from 'node-fetch';
import { URL } from 'url';
import { PROXY, ROUTES, SERVER } from './config/constants.js';
import { logger } from './middleware.js';
import { generateHeadersForUrl } from './config/domain-templates.js';
import { isM3u8Playlist, getMimeType } from './config/mime-types.js';
import { processM3u8Content } from './utils/m3u8-handler.js';
import { 
  validateUrl, 
  determineContentType, 
  processVttContent 
} from './utils/helpers.js';
import { decompressWithWorker, getWorkerStats } from './utils/worker-pool.js';
import {
  generateCacheKey, 
  getCacheItem, 
  setCacheItem, 
  getCacheStats, 
  clearCache 
} from './utils/cache.js';
import {
  recordRequest,
  recordResponse,
  recordStreamingRequest,
  recordCacheHit,
  recordCacheMiss,
  recordWorkerTask,
  getPerformanceMetrics,
  resetMetrics
} from './utils/performance-monitor.js';

const router: Router = express.Router();

// Extend Express Request type to include targetUrl
declare global {
  namespace Express {
    interface Request {
      targetUrl?: string;
    }
  }
}

/**
 * URL parameter validator middleware
 */
const validateUrlParam = (req: Request, res: Response, next: NextFunction) => {
  let url: string | undefined;
  
  // Check for URL in query parameter
  if (req.query.url) {
    url = req.query.url as string;
  } 
  // Check for URL in path parameter (using named param)
  else if (req.params.url) {
    url = req.params.url;
    // If it doesn't start with http(s)://, add it
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
  } 
  // Check for base64 encoded URL
  else if (req.params.encodedUrl) {
    try {
      url = Buffer.from(req.params.encodedUrl, 'base64').toString('utf-8');
    } catch (error) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Invalid base64 encoded URL',
        },
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  // Validate URL
  if (!url) {
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Missing URL parameter',
        usage: 'Use ?url=https://example.com',
      },
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Validate URL format and against whitelist
  const validation = validateUrl(url, {
    maxUrlLength: PROXY.MAX_REQUEST_SIZE,
    allowedDomains: PROXY.ENABLE_DOMAIN_WHITELIST ? PROXY.ALLOWED_DOMAINS : [],
  });
  
  if (!validation.valid) {
    return res.status(400).json({
      error: {
        code: 400,
        message: validation.reason || 'Invalid URL',
        url,
      },
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Store validated URL in request object
  req.targetUrl = url;
  next();
};


/**
 * Stream proxy request handler
 * Used for large files and media streaming
 */
async function streamProxyRequest(req: Request, res: Response, url: string, headers: Record<string, string>) {
  const requestStartTime = recordRequest();
  let responseSize = 0;
  
  // Track response size for streams
  const originalWrite = res.write;
  // @ts-ignore
  res.write = function(chunk) {
    if (chunk) {
      responseSize += chunk.length || 0;
    }
    return originalWrite.apply(res, arguments as any);
  };
  
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), PROXY.REQUEST_TIMEOUT);
  
  try {
    // Perform the fetch request
    const response = await fetch(url, {
      method: req.method,
      headers,
      signal: abortController.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle error responses
    if (response.status >= 400) {
      logger.warn({
        type: 'stream-proxy',
        url,
        status: response.status,
        statusText: response.statusText,
      }, `Proxy received error status: ${response.status} ${response.statusText}`);
      
      // Forward the status code
      res.status(response.status);
      
      // Try to get error body if possible
      try {
        const errorBody = await response.text();
        try {
          const jsonBody = JSON.parse(errorBody);
          recordResponse(requestStartTime, false, 0, errorBody.length);
          return res.json(jsonBody);
        } catch (e) {
          recordResponse(requestStartTime, false, 0, errorBody.length);
          return res.send(errorBody);
        }
      } catch (e) {
        recordResponse(requestStartTime, false, 0, 0);
        return res.end();
      }
    }
    
    if (process.env.USE_CLOUDFLARE === 'true') {
      // Ensure Cloudflare doesn't buffer responses
      res.setHeader('X-Accel-Buffering', 'no');
      
      // Hint to Cloudflare that this is streaming content
      res.setHeader('CF-Cache-Status', 'DYNAMIC');
    }

    // Get content type and other headers
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const contentEncoding = response.headers.get('content-encoding');
    const isCompressed = !!contentEncoding && 
                         ['gzip', 'br', 'deflate', 'zstd'].includes(contentEncoding.toLowerCase());
    
    // Set response headers
    for (const [key, value] of Object.entries(response.headers.raw())) {
      if (!['connection', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');
    
    // Set status code
    res.status(response.status);
    
    // For large files, record as streaming request
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      recordStreamingRequest(parseInt(contentLength, 10));
    }
    
    // Handle different content types and compression scenarios
    
    // Case 1: Compressed content that needs special processing (m3u8, vtt, srt)
    if (isCompressed && ['m3u8', 'vtt', 'srt'].some(ext => url.toLowerCase().endsWith(`.${ext}`))) {
      // For text-based formats that need processing but are compressed,
      // we need to decompress fully first
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await decompressWithWorker(Buffer.from(arrayBuffer), contentEncoding);
      
      // Process content if needed
      if (isM3u8Playlist(url)) {
        const responseText = new TextDecoder('utf-8').decode(buffer);
        const processedContent = processM3u8Content(responseText, {
          proxyBaseUrl: ROUTES.PROXY_BASE,
          targetUrl: url,
          urlParamName: 'url',
          preserveQueryParams: true,
        });
        
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.removeHeader('content-encoding');
        recordResponse(requestStartTime, true, arrayBuffer.byteLength, processedContent.length);
        return res.send(processedContent);
      } else if (contentType?.includes('text/vtt')) {
        const responseText = new TextDecoder('utf-8').decode(buffer);
        const processedContent = processVttContent(responseText, {
          proxyBaseUrl: ROUTES.PROXY_BASE,
          targetUrl: url,
          urlParamName: 'url',
        });
        
        res.setHeader('Content-Type', 'text/vtt');
        res.removeHeader('content-encoding');
        recordResponse(requestStartTime, true, arrayBuffer.byteLength, processedContent.length);
        return res.send(processedContent);
      }
      
      // If no special processing needed but still compressed
      res.removeHeader('content-encoding');
      recordResponse(requestStartTime, true, arrayBuffer.byteLength, buffer.length);
      return res.send(buffer);
    } 
    // Case 2: Uncompressed content that needs special processing (m3u8, vtt)
    else if (isM3u8Playlist(url) || contentType?.includes('text/vtt')) {
      try {
        // Get the full text response instead of using getReader()
        const responseText = await response.text();
        
        // Process content
        if (isM3u8Playlist(url)) {
          const processedContent = processM3u8Content(responseText, {
            proxyBaseUrl: ROUTES.PROXY_BASE,
            targetUrl: url,
            urlParamName: 'url',
            preserveQueryParams: true,
          });
          
          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
          recordResponse(requestStartTime, true, responseText.length, processedContent.length);
          return res.send(processedContent);
        } else if (contentType?.includes('text/vtt')) {
          const processedContent = processVttContent(responseText, {
            proxyBaseUrl: ROUTES.PROXY_BASE,
            targetUrl: url,
            urlParamName: 'url',
          });
          
          res.setHeader('Content-Type', 'text/vtt');
          recordResponse(requestStartTime, true, responseText.length, processedContent.length);
          return res.send(processedContent);
        }
      } catch (error) {
        logger.error({
          type: 'stream-proxy',
          url,
          error: error instanceof Error ? error.message : String(error),
        }, 'Error processing text-based format');
        
        // Fall through to buffer-based approach on error
      }
    } 
    // Case 3: Compressed content that doesn't need special processing
    else if (isCompressed) {
      // For compressed content that doesn't need special processing,
      // we can't stream it directly as the client expects uncompressed
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await decompressWithWorker(Buffer.from(arrayBuffer), contentEncoding);
      
      res.removeHeader('content-encoding');
      recordResponse(requestStartTime, true, arrayBuffer.byteLength, buffer.length);
      return res.send(buffer);
    } 
    // Case 4: Uncompressed content that doesn't need special processing - direct streaming
    else if (response.body) {
      // Set X-Accel-Buffering header to disable nginx buffering
      res.setHeader('X-Accel-Buffering', 'no');
      
      // Handle direct streaming in a Node.js compatible way
      try {
        // Check if we can access response.body as a Node.js stream
        if (typeof response.body.pipe === 'function') {
          // It's a Node.js Readable stream
          response.body.pipe(res);
          
          // Log success
          logger.debug({
            type: 'stream-proxy',
            url,
            method: 'pipe',
            contentType: contentType || 'unknown'
          }, 'Streaming response using pipe');
          
          // Set up event handlers
          response.body.on('end', () => {
            recordResponse(requestStartTime, true, 0, responseSize);
            logger.debug({
              type: 'stream-proxy',
              url,
              method: 'pipe',
              bytesTransferred: responseSize
            }, 'Stream completed');
          });
          
          response.body.on('error', (err) => {
            recordResponse(requestStartTime, false, 0, responseSize);
            logger.error({
              type: 'stream-proxy',
              url,
              method: 'pipe',
              error: err instanceof Error ? err.message : String(err)
            }, 'Stream error');
            
            // Only end response if it hasn't been sent yet
            if (!res.headersSent) {
              res.status(500).end();
            } else if (!res.writableEnded) {
              res.end();
            }
          });
          
          // This prevents the function from continuing, as response is now handled by pipe
          return;
        } else {
          // For newer fetch implementations with Web API ReadableStream
          // Use arrayBuffer as fallback since we can't directly pipe
          logger.debug({
            type: 'stream-proxy',
            url,
            method: 'buffer',
            reason: 'readable-stream-not-available'
          }, 'Falling back to buffer approach');
          
          const buffer = await response.arrayBuffer();
          recordResponse(requestStartTime, true, 0, buffer.byteLength);
          return res.send(Buffer.from(buffer));
        }
      } catch (error) {
        // If stream handling fails, fall back to buffer approach
        logger.warn({
          type: 'stream-proxy',
          url,
          error: error instanceof Error ? error.message : String(error),
          fallback: 'using-buffer'
        }, 'Stream handling failed, using buffer fallback');
        
        try {
          const buffer = await response.arrayBuffer();
          recordResponse(requestStartTime, true, 0, buffer.byteLength);
          return res.send(Buffer.from(buffer));
        } catch (err) {
          recordResponse(requestStartTime, false, 0, 0);
          logger.error({
            type: 'stream-proxy',
            url,
            error: err instanceof Error ? err.message : String(err)
          }, 'Buffer fallback failed');
          
          if (!res.headersSent) {
            return res.status(500).json({
              error: {
                code: 500,
                message: 'Failed to process content',
                url
              },
              success: false,
              timestamp: new Date().toISOString()
            });
          } else if (!res.writableEnded) {
            return res.end();
          }
        }
      }
    }
    
    // Fallback for any other scenarios not caught above
    try {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (contentEncoding) {
        const decompressed = await decompressWithWorker(buffer, contentEncoding);
        res.removeHeader('content-encoding');
        recordResponse(requestStartTime, true, buffer.length, decompressed.length);
        return res.send(decompressed);
      }
      
      recordResponse(requestStartTime, true, 0, buffer.length);
      return res.send(buffer);
    } catch (error) {
      recordResponse(requestStartTime, false, 0, 0);
      logger.error({
        type: 'stream-proxy',
        url,
        error: error instanceof Error ? error.message : String(error)
      }, 'Final fallback failed');
      
      if (!res.headersSent) {
        return res.status(500).json({
          error: {
            code: 500,
            message: 'Failed to process content',
            url
          },
          success: false,
          timestamp: new Date().toISOString()
        });
      } else if (!res.writableEnded) {
        return res.end();
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle proxy errors
    logger.error({
      type: 'stream-proxy',
      url,
      error: error instanceof Error ? error.message : String(error),
    }, 'Stream proxy request failed');
    
    // Determine appropriate error message and status
    let statusCode = 500;
    let errorMessage = 'Failed to proxy request';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        statusCode = 504;
        errorMessage = `Request timed out after ${PROXY.REQUEST_TIMEOUT}ms`;
      } else {
        errorMessage = error.message || errorMessage;
      }
    }
    
    recordResponse(requestStartTime, false, 0, 0);
    
    if (!res.headersSent) {
      res.status(statusCode).json({
        error: {
          code: statusCode,
          message: errorMessage,
          url,
        },
        success: false,
        timestamp: new Date().toISOString(),
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
}

/**
 * Main proxy request handler
 */
async function proxyRequest(req: Request, res: Response, next: NextFunction) {
  const url = req.targetUrl;
  
  if (!url) {
    return next(new Error('Target URL is required'));
  }
  
  const requestStartTime = recordRequest();
  let responseSize = 0;
  let requestSize = req.headers['content-length'] ? parseInt(req.headers['content-length'] as string, 10) : 0;
  
  // Track response size by intercepting res.send
  const originalSend = res.send;
  // @ts-ignore
  res.send = function(body) {
    try {
      responseSize = body?.length || 0;
    } catch (e) {
      responseSize = 0;
    }
    return originalSend.apply(res, arguments as any);
  };
  
  try {
    // Log the request
    logger.debug({
      type: 'proxy',
      url,
      method: req.method,
      headers: req.headers,
    }, `Proxying request to ${url}`);
    
    // Check cache first for GET requests
    if (req.method === 'GET') {
      // Generate cache key based on URL and relevant headers
      const cacheKey = generateCacheKey(url, req.headers);
      
      // Try to get from cache
      const cachedItem = getCacheItem(cacheKey);
      if (cachedItem) {
        // If found in cache, send directly
        recordCacheHit();
        const contentType = determineContentType(cachedItem.data, null, url);
        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
        
        // Set cache-hit header for debugging
        res.setHeader('X-Cache', 'HIT');
        
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Range');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');
        
        // If we have a range request and cached the full response
        if (req.headers.range) {
          const range = req.headers.range;
          const match = range.match(/bytes=(\d+)-(\d+)?/);
          
          if (match) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : cachedItem.data.length - 1;
            
            // Validate range request
            if (start >= 0 && end < cachedItem.data.length && start <= end) {
              const slice = cachedItem.data.slice(start, end + 1);
              res.setHeader('Content-Range', `bytes ${start}-${end}/${cachedItem.data.length}`);
              res.setHeader('Content-Length', slice.length.toString());
              res.status(206);
              recordResponse(requestStartTime, true, 0, slice.length);
              return res.send(slice);
            }
          }
        }
        
        // Regular request, send full cached response
        recordResponse(requestStartTime, true, 0, cachedItem.data.length);
        return res.send(cachedItem.data);
      } else {
        recordCacheMiss();
        // If not in cache, set a header for debugging
        res.setHeader('X-Cache', 'MISS');
      }
    }
    
    // Set up request headers
    const headers: Record<string, string> = {};
    
    // Forward headers, excluding those that should be removed
    const excludeHeaders = [
      'host',
      'connection',
      'content-length',
      'forwarded',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
    ];
    
    for (const [key, value] of Object.entries(req.headers)) {
      if (!excludeHeaders.includes(key.toLowerCase()) && value) {
        headers[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }
    
    // Parse the target URL
    const targetUrl = new URL(url);
    
    // Apply domain-specific header templates
    const domainHeaders = generateHeadersForUrl(targetUrl);
    Object.assign(headers, domainHeaders);
    
    // Set host header to match target URL
    headers['host'] = targetUrl.host;
    
    // Explicitly handle Range header for audio segments
    if (req.headers.range) {
      headers['range'] = req.headers.range as string;
      logger.debug({
        type: 'range-request',
        url,
        range: req.headers.range
      }, 'Forwarding Range header');
    }
    
    // Get request body for non-GET requests
    let body: any = null;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      body = req.body;
    }
    
    // For GET requests that benefit from streaming (large files, media)
    // Use the streaming approach
    const STREAM_SIZE_THRESHOLD = parseInt(process.env.STREAM_SIZE_THRESHOLD || '1048576', 10);
    const ENABLE_STREAMING = process.env.ENABLE_STREAMING !== 'false';
    
    if (ENABLE_STREAMING && req.method === 'GET' && 
        (url.endsWith('.ts') || 
         url.endsWith('.m3u8') || 
         url.endsWith('.mp4') || 
         url.endsWith('.mp3') || 
         url.endsWith('.m4s') || 
         url.includes('segment-'))) {
      return streamProxyRequest(req, res, url, headers);
    }
    
    // For other requests, use the classic approach
    // Perform the fetch request
    const startTime = Date.now();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), PROXY.REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        method: req.method,
        headers,
        body,
        redirect: 'follow',
        signal: abortController.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Get content type from response
      const contentType = response.headers.get('content-type');
      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get('content-length');
      
      // Check if this is a large file that should be streamed
      if (ENABLE_STREAMING && 
          contentLength && 
          parseInt(contentLength, 10) > STREAM_SIZE_THRESHOLD && 
          req.method === 'GET') {
        // Use streaming for large files
        return streamProxyRequest(req, res, url, headers);
      }
      
      // Check if this is an audio segment
      const isAudioSegment = contentType?.includes('audio/mp4') || 
                             contentType?.includes('audio/aac') ||
                             url.includes('.aac') ||
                             url.toLowerCase().includes('mp4a.40');
      
      // Special debug for audio segments
      if (isAudioSegment) {
        logger.debug({
          type: 'audio-segment',
          url,
          contentType,
          status: response.status,
          range: req.headers.range,
          responseContentRange: response.headers.get('content-range'),
          responseHeaders: Object.fromEntries(response.headers.entries()),
        }, 'Audio segment debug info');
      }
      
      // Log response headers for debugging
      logger.debug({
        type: 'proxy',
        url,
        status: response.status,
        contentType,
        contentEncoding,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      }, `Response headers for ${url}`);
      
      // Detect M3U8 content by content-type or extension if not already determined
      const isM3u8Content = isM3u8Playlist(url) || 
                          contentType?.includes('application/vnd.apple.mpegurl') || 
                          contentType?.includes('application/x-mpegurl') ||
                          url.toLowerCase().endsWith('.m3u8');
      
      // Forward response headers
      for (const [key, value] of Object.entries(response.headers.raw())) {
        if (!['connection', 'transfer-encoding'].includes(key.toLowerCase())) {
          // Keep content-encoding header for audio segments
          if (key.toLowerCase() === 'content-encoding' && !isAudioSegment) {
            continue;
          }
          res.setHeader(key, value);
        }
      }
      
      // Always include Accept-Ranges for media segments
      if (!res.getHeader('Accept-Ranges') && (isAudioSegment || url.endsWith('.ts'))) {
        res.setHeader('Accept-Ranges', 'bytes');
      }
      
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Range');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');
      
      // Handle error status codes (4xx, 5xx) properly
      if (response.status >= 400) {
        logger.warn({
          type: 'proxy',
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime: Date.now() - startTime,
        }, `Proxy received error status: ${response.status} ${response.statusText}`);
        
        // Try to get error response text if possible
        let errorBody;
        try {
          // Try text first
          errorBody = await response.text();
        } catch (e) {
          // If text fails, return empty body
          errorBody = '';
        }
        
        // Forward the status code exactly as received
        res.status(response.status);
        
        recordResponse(requestStartTime, false, requestSize, errorBody.length);
        
        // Check if the error body is JSON
        try {
          const jsonBody = JSON.parse(errorBody);
          return res.json(jsonBody);
        } catch (e) {
          // Not JSON, return as text
          return res.send(errorBody);
        }
      }
      
      // Special handling for partial content (206) responses - especially for audio segments
      if (response.status === 206) {
        try {
          // Ensure Content-Range header is forwarded
          const contentRange = response.headers.get('content-range');
          if (contentRange) {
            res.setHeader('Content-Range', contentRange);
          }
          
          // Get the content as a buffer and send it directly
          const buffer = await response.arrayBuffer();
          
          // Set status code to 206 Partial Content
          res.status(206);
          
          logger.debug({
            type: 'partial-content',
            url,
            status: 206,
            contentType: res.getHeader('Content-Type'),
            contentRange: contentRange,
            responseTime: Date.now() - startTime,
            size: buffer.byteLength
          }, `Proxied partial content for ${url}`);
          
          const responseBuffer = Buffer.from(buffer);
          recordResponse(requestStartTime, true, requestSize, responseBuffer.length);
          
          // Return the buffer directly without modifying
          return res.send(responseBuffer);
        } catch (error) {
          logger.error({
            type: 'partial-content-error',
            url,
            error: error instanceof Error ? error.message : String(error),
          }, 'Error processing partial content');
          
          recordResponse(requestStartTime, false, requestSize, 0);
          
          return res.status(500).json({
            error: {
              code: 500,
              message: 'Failed to process partial content',
              url,
              details: error instanceof Error ? error.message : String(error)
            },
            success: false,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Direct handling for audio segments
      if (isAudioSegment && response.status === 200) {
        try {
          // Get the content as a buffer and send it directly
          const buffer = await response.arrayBuffer();
          
          // Ensure content type is preserved exactly
          if (contentType) {
            res.setHeader('Content-Type', contentType);
          }
          
          logger.debug({
            type: 'audio',
            url,
            status: response.status,
            contentType: contentType,
            responseTime: Date.now() - startTime,
            size: buffer.byteLength
          }, `Proxied audio segment for ${url}`);
          
          const responseBuffer = Buffer.from(buffer);
          recordResponse(requestStartTime, true, requestSize, responseBuffer.length);
          
          // Return the buffer directly
          return res.send(responseBuffer);
        } catch (error) {
          logger.error({
            type: 'audio-error',
            url,
            error: error instanceof Error ? error.message : String(error),
          }, 'Error processing audio segment');
          
          recordResponse(requestStartTime, false, requestSize, 0);
          
          return res.status(500).json({
            error: {
              code: 500,
              message: 'Failed to process audio segment',
              url,
              details: error instanceof Error ? error.message : String(error)
            },
            success: false,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Handle M3U8 playlists - requires special processing for URL rewriting
      if (isM3u8Content && response.status === 200) {
        try {
          // Get the content as a buffer first
          const responseBuffer = await response.arrayBuffer();
          
          // Decompress content if needed
          const decompressedBuffer = await decompressWithWorker(
            Buffer.from(responseBuffer),
            contentEncoding || undefined
          );
          
          // Convert buffer to string with UTF-8 encoding
          const responseText = new TextDecoder('utf-8').decode(decompressedBuffer);
          
          // Log the raw content for debugging
          logger.debug({
            type: 'proxy',
            url,
            contentType: 'application/vnd.apple.mpegurl',
            rawContentStart: responseText.substring(0, 100),
            decompressed: !!contentEncoding,
            decompressedLength: decompressedBuffer.length,
            originalLength: responseBuffer.byteLength
          }, `Raw M3U8 content start for ${url}`);
          
          // Check for #EXTM3U in the content (case insensitive)
          if (!responseText.toUpperCase().includes('#EXTM3U')) {
            logger.warn({
              type: 'proxy',
              url,
              contentLength: responseText.length,
              contentSample: responseText.substring(0, 200)
            }, `Content doesn't appear to be a valid M3U8 playlist (missing #EXTM3U) but has length ${responseText.length}`);
            
            // Just return the content as-is
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            // Don't forward the content-encoding, we've already decompressed
            res.removeHeader('content-encoding');
            recordResponse(requestStartTime, true, requestSize, decompressedBuffer.length);
            return res.send(Buffer.from(decompressedBuffer));
          }
          
          // At this point we have valid M3U8 content
          logger.info({
            type: 'proxy',
            url,
            isValid: true
          }, `Valid M3U8 content found at ${url}`);
          
          // Process the M3U8 content to rewrite URLs
          const processedContent = processM3u8Content(responseText, {
            proxyBaseUrl: ROUTES.PROXY_BASE,
            targetUrl: url,
            urlParamName: 'url',
            preserveQueryParams: true,
          });
          
          // Set explicit content type for M3U8
          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
          // Don't forward the content-encoding, we've already decompressed
          res.removeHeader('content-encoding');
          
          logger.debug({
            type: 'proxy',
            url,
            status: response.status,
            contentType: 'application/vnd.apple.mpegurl',
            responseTime: Date.now() - startTime,
          }, `Processed M3U8 playlist for ${url}`);
          
          recordResponse(requestStartTime, true, requestSize, processedContent.length);
          return res.send(processedContent);
        } catch (error) {
          logger.error({
            type: 'proxy',
            url,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          }, 'Error processing M3U8 content');
          
          // Try to return the original content on error
          try {
            // Get content encoding from headers
            const contentEncoding = response.headers.get('content-encoding');
            const buffer = await response.arrayBuffer();
            
            // Try to decompress content even on error
            const decompressedBuffer = await decompressWithWorker(
              Buffer.from(buffer),
              contentEncoding || undefined
            ).catch(() => Buffer.from(buffer));
            
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            // Don't forward the content-encoding, we've already decompressed
            res.removeHeader('content-encoding');
            res.status(200);
            recordResponse(requestStartTime, true, requestSize, decompressedBuffer.length);
            return res.send(Buffer.from(decompressedBuffer));
          } catch (e) {
            recordResponse(requestStartTime, false, requestSize, 0);
            res.status(500).json({
              error: {
                code: 500,
                message: 'Failed to process M3U8 content',
                url,
                details: error instanceof Error ? error.message : String(error)
              },
              success: false,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      // Handle WebVTT subtitle files
      else if (contentType?.includes('text/vtt') && response.status === 200) {
        try {
          // Get content as text
          const responseText = await response.text();
          
          // Process VTT content to rewrite image URLs
          const processedContent = processVttContent(responseText, {
            proxyBaseUrl: ROUTES.PROXY_BASE,
            targetUrl: url,
            urlParamName: 'url',
          });
          
          // Set explicit content type for VTT
          res.setHeader('Content-Type', 'text/vtt');
          
          // Don't forward the content-encoding if any
          if (contentEncoding) {
            res.removeHeader('content-encoding');
          }
          
          logger.debug({
            type: 'proxy',
            url,
            status: response.status,
            contentType: 'text/vtt',
            responseTime: Date.now() - startTime,
          }, `Processed VTT subtitle file for ${url}`);
          
          recordResponse(requestStartTime, true, requestSize, processedContent.length);
          return res.send(processedContent);
        } catch (error) {
          logger.error({
            type: 'proxy',
            url,
            error: error instanceof Error ? error.message : String(error),
          }, 'Error processing VTT content');
          
          // Fall back to returning unprocessed content
          // Continue to the general content handling below
        }
      }
      // Handle all other content types using a buffer-based approach
      else if (response.body) {
        try {
          // Get the content as an ArrayBuffer
          const responseBuffer = await response.arrayBuffer();
          
          // Decompress content if needed
          const buffer = contentEncoding && !isAudioSegment
            ? await decompressWithWorker(
                Buffer.from(responseBuffer),
                contentEncoding
              )
            : Buffer.from(responseBuffer);
          
          // Perform binary analysis to detect actual content type
          const detectedType = determineContentType(buffer, contentType, url);
          
          // Set the appropriate content type
          if (detectedType && !isAudioSegment) {
            res.setHeader('Content-Type', detectedType);
            
            // Log if we're overriding the content type
            if (detectedType !== contentType) {
              logger.info({
                type: 'proxy',
                url,
                originalContentType: contentType || 'none',
                newContentType: detectedType
              }, `Binary analysis: overriding content type for ${url}`);
            }
          } else if (contentType) {
            res.setHeader('Content-Type', contentType);
          } else {
            // Try to determine content type by extension
            const mimeType = getMimeType(url);
            if (mimeType) {
              res.setHeader('Content-Type', mimeType);
            }
          }
          
          // Don't forward content-encoding header if we've decompressed the content
          if (contentEncoding && !isAudioSegment) {
            res.removeHeader('content-encoding');
          }
          
          // Set status code
          res.status(response.status);
          
          logger.debug({
            type: 'proxy',
            url,
            status: response.status,
            contentType: res.getHeader('Content-Type'),
            responseTime: Date.now() - startTime,
            size: buffer.byteLength,
            decompressed: !!contentEncoding && !isAudioSegment
          }, `Proxied content for ${url}`);
          
          // Add to cache for successful GET requests
          if (req.method === 'GET' && response.status === 200 && !req.headers.range) {
            // Skip caching for very large responses
            if (buffer.byteLength <= 10 * 1024 * 1024) { // Only cache up to 10MB
              const cacheKey = generateCacheKey(url, req.headers);
              setCacheItem(cacheKey, buffer, buffer.byteLength);
            }
          }
          
          recordResponse(requestStartTime, true, requestSize, buffer.byteLength);
          
          // Return the buffer directly
          return res.send(Buffer.from(buffer));
        } catch (error) {
          logger.error({
            type: 'proxy',
            url,
            error: error instanceof Error ? error.message : String(error),
          }, 'Error processing response content');
          
          recordResponse(requestStartTime, false, requestSize, 0);
          
          return res.status(500).json({
            error: {
              code: 500,
              message: 'Failed to process response content',
              url,
              details: error instanceof Error ? error.message : String(error)
            },
            success: false,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // For empty responses
        res.status(response.status);
        recordResponse(requestStartTime, true, requestSize, 0);
        return res.end();
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    // Handle proxy errors
    logger.error({
      type: 'proxy',
      url,
      error: error instanceof Error ? error.message : String(error),
    }, 'Proxy request failed');
    
    // Determine appropriate error message and status
    let statusCode = 500;
    let errorMessage = 'Failed to proxy request';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        statusCode = 504;
        errorMessage = `Request timed out after ${PROXY.REQUEST_TIMEOUT}ms`;
      } else {
        errorMessage = error.message || errorMessage;
      }
    }
    
    recordResponse(requestStartTime, false, requestSize, 0);
    
    res.status(statusCode).json({
      error: {
        code: statusCode,
        message: errorMessage,
        url,
      },
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
}

// Status endpoint
router.get('/status', (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  return res.json({
    status: 'ok',
    version: process.env.npm_package_version || '0.2.0',
    uptime,
    timestamp: new Date().toISOString(),
    environment: SERVER.NODE_ENV,
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
    },
  });
});

// Cache endpoints
router.get('/cache/stats', (req, res) => {
  res.json({
    status: 'ok',
    data: getCacheStats(),
    timestamp: new Date().toISOString(),
  });
});

router.post('/cache/clear', (req, res) => {
  clearCache();
  res.json({
    status: 'ok',
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

// Worker stats endpoint
router.get('/workers/stats', (req, res) => {
  res.json({
    status: 'ok',
    data: getWorkerStats(),
    timestamp: new Date().toISOString(),
  });
});

// Performance metrics endpoints
router.get('/metrics', (req, res) => {
  res.json({
    status: 'ok',
    data: getPerformanceMetrics(),
    timestamp: new Date().toISOString(),
  });
});

router.post('/metrics/reset', (req, res) => {
  resetMetrics();
  res.json({
    status: 'ok',
    message: 'Performance metrics reset successfully',
    timestamp: new Date().toISOString(),
  });
});

// Main proxy route with URL as query parameter
router.all('/', validateUrlParam, proxyRequest);

// Proxy route with URL as path parameter
router.all('/:url(*)', validateUrlParam, proxyRequest);

// Proxy route with base64 encoded URL
router.all('/base64/:encodedUrl', validateUrlParam, proxyRequest);

export default router;