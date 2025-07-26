import { promisify } from 'util';
import { gunzip, brotliDecompress, inflate } from 'zlib';
import { decompress as fzstdDecompress } from 'fzstd';
import { URL } from 'url';
import { logger } from '../middleware.js';

// Convert callback-based functions to promise-based versions
const gunzipAsync = promisify(gunzip);
const brotliDecompressAsync = promisify(brotliDecompress);
const inflateAsync = promisify(inflate);

// ==================== COMPRESSION HANDLER ====================

/**
 * Enhanced decompression function with better format detection
 */
export async function decompressContent(
  buffer: Buffer | ArrayBuffer,
  contentEncoding?: string | null
): Promise<Buffer> {
  // Ensure we're working with a Node.js Buffer
  const inputBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  
  // If no content-encoding header is provided, attempt to detect the format
  if (!contentEncoding) {
    // Check for gzip magic bytes (0x1F 0x8B)
    if (inputBuffer.length > 2 && inputBuffer[0] === 0x1F && inputBuffer[1] === 0x8B) {
      try {
        return await gunzipAsync(inputBuffer);
      } catch (error) {
        logger.error('Failed to decompress auto-detected gzip', error);
      }
    }
    
    // Check for zstd magic bytes (0x28 0xB5 0x2F 0xFD)
    if (inputBuffer.length > 4 && 
        inputBuffer[0] === 0x28 && 
        inputBuffer[1] === 0xB5 && 
        inputBuffer[2] === 0x2F && 
        inputBuffer[3] === 0xFD) {
      try {
        const result = await fzstdDecompress(inputBuffer);
        return Buffer.from(result);
      } catch (error) {
        logger.error('Failed to decompress auto-detected zstd', error);
      }
    }
    
    // Try brotli (no reliable magic bytes, but worth a try)
    try {
      const result = await brotliDecompressAsync(inputBuffer);
      return result;
    } catch (error) {
      // Silently fail, this was just a guess
    }
    
    // Try deflate (no reliable magic bytes, but worth a try)
    try {
      const result = await inflateAsync(inputBuffer);
      return result;
    } catch (error) {
      // Silently fail, this was just a guess
    }
    
    // If all auto-detection fails, return the original buffer
    return inputBuffer;
  }
  
  // If content-encoding header is provided, use it
  const encoding = contentEncoding.toLowerCase().trim();
  
  try {
    switch (encoding) {
      case 'gzip':
        return await gunzipAsync(inputBuffer);
        
      case 'br':
        return await brotliDecompressAsync(inputBuffer);
        
      case 'zstd':
        const decompressedZstdUint8Array = await fzstdDecompress(inputBuffer);
        return Buffer.from(decompressedZstdUint8Array);
        
      case 'deflate':
        return await inflateAsync(inputBuffer);
        
      default:
        logger.warn(`Unknown content-encoding header: '${encoding}'`);
        
        // Try all decompression methods even with an unknown encoding
        try {
          return await gunzipAsync(inputBuffer);
        } catch (e) {}
        
        try {
          return await brotliDecompressAsync(inputBuffer);
        } catch (e) {}
        
        try {
          const result = await fzstdDecompress(inputBuffer);
          return Buffer.from(result);
        } catch (e) {}
        
        try {
          return await inflateAsync(inputBuffer);
        } catch (e) {}
        
        // If nothing works, return the original buffer
        return inputBuffer;
    }
  } catch (error) {
    logger.error(`Error decompressing with '${encoding}':`, error);
    
    // Try alternative methods if the specified one fails
    if (encoding !== 'gzip') {
      try {
        return await gunzipAsync(inputBuffer);
      } catch (e) {}
    }
    
    if (encoding !== 'br') {
      try {
        return await brotliDecompressAsync(inputBuffer);
      } catch (e) {}
    }
    
    if (encoding !== 'zstd') {
      try {
        const result = await fzstdDecompress(inputBuffer);
        return Buffer.from(result);
      } catch (e) {}
    }
    
    if (encoding !== 'deflate') {
      try {
        return await inflateAsync(inputBuffer);
      } catch (e) {}
    }
    
    // If all decompression attempts fail, return the original content
    return inputBuffer;
  }
}

// ==================== URL VALIDATOR ====================

/**
 * Interface for URL validation result
 */
export interface UrlValidationResult {
  valid: boolean;
  reason?: string;
  hostname?: string;
}

/**
 * URL Validator Options
 */
export interface UrlValidatorOptions {
  allowedDomains?: string[];
  maxUrlLength?: number;
  requireProtocol?: boolean;
}

/**
 * Validates a URL using regex and additional checks
 * @param url The URL to validate
 * @param options Validation options
 * @returns Validation result with validity status and optional reason
 */
export function validateUrl(
  url: string, 
  options: UrlValidatorOptions = {}
): UrlValidationResult {
  const {
    maxUrlLength = 2048,
    allowedDomains = [],
    requireProtocol = false
  } = options;
  
  // Check if URL is empty
  if (!url) {
    return { 
      valid: false, 
      reason: 'URL cannot be empty' 
    };
  }
  
  // Check URL length
  if (url.length > maxUrlLength) {
    return { 
      valid: false, 
      reason: `URL exceeds maximum length of ${maxUrlLength} characters` 
    };
  }
  
  // Special case for local paths starting with / (proxy internal routing)
  if (url.startsWith('/')) {
    return { valid: true };
  }
  
  try {
    // If it's a full URL with protocol, validate it
    if (url.includes('://')) {
      const urlObj = new URL(url);
      
      // Check against domain whitelist if provided and not empty
      if (allowedDomains.length > 0) {
        if (!allowedDomains.includes(urlObj.hostname)) {
          return {
            valid: false,
            reason: 'Domain not in allowed domains list',
            hostname: urlObj.hostname
          };
        }
      }
      
      return {
        valid: true,
        hostname: urlObj.hostname
      };
    } 
    // If protocol is required but not present
    else if (requireProtocol) {
      return {
        valid: false,
        reason: 'URL must include protocol (http:// or https://)'
      };
    }
    
    // For relative URLs or paths, just accept them
    return { valid: true };
    
  } catch (error) {
    // If URL parsing failed, it's likely an invalid URL
    return {
      valid: false,
      reason: 'Invalid URL format'
    };
  }
}

// ==================== TRANSPORT STREAM HANDLER ====================

/**
 * Detects if a binary buffer contains MPEG-2 Transport Stream data
 * TS packets start with sync byte 0x47 (71 in decimal)
 * 
 * @param buffer Binary data to analyze
 * @returns Boolean indicating if it's likely a TS segment
 */
export function detectTransportStream(buffer: ArrayBuffer | Buffer | Uint8Array): boolean {
  try {
    // Convert to Uint8Array if it's not already
    const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    
    // Minimum size check
    if (data.length < 188) {
      return false;
    }
    
    // Check first byte for TS sync byte (0x47)
    if (data[0] !== 0x47) {
      return false;
    }
    
    // Check additional TS sync bytes at 188-byte intervals
    // Only need to find 1 additional sync byte to identify as TS
    for (let i = 1; i <= 3; i++) {
      const offset = i * 188;
      if (offset < data.length && data[offset] === 0x47) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.error('Error detecting transport stream:', error);
    return false;
  }
}

/**
 * Analyze response data and determine if content type should be overridden
 * 
 * @param buffer Response body as buffer
 * @param originalContentType Original content type from response
 * @param url The URL of the resource
 * @returns The correct content type to use
 */
export function determineContentType(
  buffer: ArrayBuffer | Buffer | Uint8Array,
  originalContentType: string | null | undefined,
  url: string
): string {
  // If it's a transport stream, return video/mp2t regardless of original type
  if (detectTransportStream(buffer)) {
    return 'video/mp2t';
  }
  
  // If URL ends with .m3u8 but content type doesn't match
  if (url.toLowerCase().endsWith('.m3u8') &&
      (!originalContentType || 
       !originalContentType.includes('application/vnd.apple.mpegurl'))) {
    return 'application/vnd.apple.mpegurl';
  }
  
  // Return the original content type if it exists
  return originalContentType || 'application/octet-stream';
}

// ==================== VTT HANDLER ====================

/**
 * Interface for VTT handler options
 */
export interface VttHandlerOptions {
  proxyBaseUrl: string;
  targetUrl: string;
  urlParamName?: string;
}

/**
 * Process WebVTT content to rewrite image URLs
 * @param content The VTT content as string
 * @param options Handler options
 * @returns Processed VTT content with rewritten URLs
 */
export function processVttContent(
  content: string,
  options: VttHandlerOptions
): string {
  const {
    proxyBaseUrl,
    targetUrl,
    urlParamName = 'url',
  } = options;
  
  try {
    // Parse the base URL for resolving relative paths
    const targetUrlObj = new URL(targetUrl);
    const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    
    // Find all image references (typically .jpg, .png, etc.)
    const imageRegex = /\b[^\s"']+?\.(jpg|jpeg|png|gif|webp)\b/gi;
    const matches = content.match(imageRegex);
    
    // No images to process
    if (!matches) {
      return content;
    }
    
    // Process each unique image URL
    const uniqueUrls = [...new Set(matches)];
    let processedContent = content;
    
    for (const imageUrl of uniqueUrls) {
      // Resolve relative URLs
      let absoluteUrl: string;
      
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Already an absolute URL
        absoluteUrl = imageUrl;
      } else if (imageUrl.startsWith('//')) {
        // Protocol-relative URL
        absoluteUrl = `${targetUrlObj.protocol}${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        // Root-relative URL
        absoluteUrl = `${targetUrlObj.protocol}//${targetUrlObj.host}${imageUrl}`;
      } else {
        // Relative URL - resolve against base path
        absoluteUrl = new URL(imageUrl, basePath).toString();
      }
      
      // Create the proxied URL
      const proxyUrl = `${proxyBaseUrl}?${urlParamName}=${encodeURIComponent(absoluteUrl)}`;
      
      // Replace all occurrences of this image URL
      processedContent = processedContent.replace(
        new RegExp(escapeRegExp(imageUrl), 'g'),
        proxyUrl
      );
    }
    
    return processedContent;
  } catch (error) {
    logger.error('Error processing VTT content:', error);
    
    // Return original content on error
    return content;
  }
}

/**
 * Escape special characters for use in a regular expression
 * @param string String to escape
 * @returns Escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export all helper functions
export default {
  decompressContent,
  validateUrl,
  determineContentType,
  detectTransportStream,
  processVttContent,
  escapeRegExp,
};
