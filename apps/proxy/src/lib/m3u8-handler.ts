export function processM3u8(
  content: string,
  targetUrl: string
): string {
  try {
    console.log(`targetUrl`, targetUrl)
    const targetUrlObj = new URL(targetUrl);
    
    let basePath = targetUrl;
    if (targetUrl.endsWith('.m3u8')) {
      // https://domain/whatever/name.m3u8 => https://domain/whatever/
      basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    } else if (!basePath.endsWith('/')) {
      basePath = basePath + '/';
    }
    
    const lines = content.split(/\r?\n/);
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        // #EXT-X-I-FRAME-STREAM-INF
        if (line.includes('URI="')) {
          const uriMatch = line.match(/URI="([^"]+)"/);

          if (uriMatch && uriMatch[1] /* the matched value */) {
            const originalUri = uriMatch[1];
            
            let absoluteUri: string;
            if (originalUri.startsWith('http://') || originalUri.startsWith('https://')) {
              absoluteUri = originalUri;
            } else {
              // trimmedLine => name.m3u8
              // basePath => https://domain/whatever/
              // absoluteUrl => https://domain/whatever/name.m3u8
              absoluteUri = new URL(originalUri, basePath).toString();
            }
            
            const proxyUrl = `/proxy?url=${encodeURIComponent(absoluteUri)}`;
            
            return line.replace(/URI="([^"]+)"/, `URI="${proxyUrl}"`);
          }
        }
        
        // #EXT-X-STREAM-INF
        return line;
      }
      
      if (trimmedLine.length > 0) {
        if (trimmedLine.startsWith('/proxy')) {
          return line;
        }
        
        let absoluteUrl: string;
        if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
          absoluteUrl = trimmedLine;
        } else if (trimmedLine.startsWith('//')) {
          absoluteUrl = `${targetUrlObj.protocol}${trimmedLine}`;
        } else {
          // trimmedLine => name.m3u8
          // basePath => https://domain/whatever/
          // absoluteUrl => https://domain/whatever/name.m3u8
          absoluteUrl = new URL(trimmedLine, basePath).toString();
        }
        
        return `/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      }
      
      return line;
    });

    return processedLines.join('\n');
  } catch (error) {
    console.error('Error processing M3U8 content:', error);
    return content;
  }
}