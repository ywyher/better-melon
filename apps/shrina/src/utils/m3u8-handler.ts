import { URL } from 'url';

/**
 * Interface for M3U8 handler options
 */
export interface M3u8HandlerOptions {
  proxyBaseUrl: string;
  targetUrl: string;
  urlParamName?: string;
  preserveQueryParams?: boolean;
}

/**
 * Processes an M3U8 playlist to rewrite URLs through the proxy
 * This ensures that all segments, keys, and other referenced files 
 * are also fetched through the CORS proxy
 * 
 * @param content The M3U8 content as string
 * @param options Handler options
 * @returns Processed M3U8 content with rewritten paths
 */
export function processM3u8Content(
  content: string,
  options: M3u8HandlerOptions
): string {
  const {
    proxyBaseUrl,
    targetUrl,
    urlParamName = 'url',
  } = options;
  
  try {
    // Parse the base URL for resolving relative paths
    const targetUrlObj = new URL(targetUrl);
    
    // Get the base path by removing the filename from the URL path
    let basePath = targetUrl;
    if (targetUrl.endsWith('.m3u8')) {
      basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    } else if (!basePath.endsWith('/')) {
      basePath = basePath + '/';
    }
    
    // Process content line by line
    const lines = content.split(/\r?\n/);
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a comment line (starts with #)
      if (trimmedLine.startsWith('#')) {
        // Check if this line contains URI= attribute (like #EXT-X-KEY or #EXT-X-MEDIA)
        if (line.includes('URI="')) {
          // Extract URI value
          const uriMatch = line.match(/URI="([^"]+)"/);
          if (uriMatch && uriMatch[1]) {
            const originalUri = uriMatch[1];
            
            // Handle different URI types
            let absoluteUri: string;
            if (originalUri.startsWith('http://') || originalUri.startsWith('https://')) {
              // Already an absolute URL
              absoluteUri = originalUri;
            } else {
              // Relative URL - resolve against base path
              absoluteUri = new URL(originalUri, basePath).toString();
            }
            
            // Create the proxy URL
            const proxyUrl = `${proxyBaseUrl}?${urlParamName}=${encodeURIComponent(absoluteUri)}`;
            
            // Replace the URI in the original line
            return line.replace(/URI="([^"]+)"/, `URI="${proxyUrl}"`);
          }
        }
        
        // Return unmodified comment line if not containing URI
        return line;
      }
      
      // Handle non-comment lines that might be URLs (segments, etc.)
      if (trimmedLine.length > 0) {
        // Ignore if it already looks like a proxied URL
        if (trimmedLine.startsWith(proxyBaseUrl)) {
          return line;
        }
        
        // Handle different URL types
        let absoluteUrl: string;
        if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
          // Already an absolute URL
          absoluteUrl = trimmedLine;
        } else if (trimmedLine.startsWith('//')) {
          // Protocol-relative URL - use the same protocol as the target
          absoluteUrl = `${targetUrlObj.protocol}${trimmedLine}`;
        } else {
          // Relative URL - resolve against base path
          absoluteUrl = new URL(trimmedLine, basePath).toString();
        }
        
        // Create the proxy URL
        return `${proxyBaseUrl}?${urlParamName}=${encodeURIComponent(absoluteUrl)}`;
      }
      
      // Return unmodified empty lines
      return line;
    });
    
    return processedLines.join('\n');
  } catch (error) {
    console.error('Error processing M3U8 content:', error);
    // Return original content on error to avoid breaking playback
    return content;
  }
}

/**
 * Generates a proxy URL for a given target URL
 * @param proxyBaseUrl The base URL of the proxy
 * @param targetUrl The target URL to proxy
 * @param urlParamName The query parameter name for the URL
 * @returns The proxy URL
 */
export function generateProxyUrl(
  proxyBaseUrl: string,
  targetUrl: string,
  urlParamName: string = 'url'
): string {
  return `${proxyBaseUrl}?${urlParamName}=${encodeURIComponent(targetUrl)}`;
}

export default {
  processM3u8Content,
  generateProxyUrl
};