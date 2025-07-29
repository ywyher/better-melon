import { promisify } from 'util';
import { gunzip, brotliDecompress, inflate } from 'zlib';
import { decompress as fzstdDecompress } from 'fzstd';

// Convert callback-based functions to promise-based versions
const gunzipAsync = promisify(gunzip);
const brotliDecompressAsync = promisify(brotliDecompress);
const inflateAsync = promisify(inflate);

/**
 * Worker implementation of decompression
 */
export default async function decompress({ buffer, contentEncoding }) {
  // Convert base64 string back to buffer
  const inputBuffer = Buffer.from(buffer, 'base64');
  
  try {
    let result;
    
    // If content-encoding header is provided, use it
    if (contentEncoding) {
      const encoding = contentEncoding.toLowerCase().trim();
      
      switch (encoding) {
        case 'gzip':
          result = await gunzipAsync(inputBuffer);
          break;
          
        case 'br':
          result = await brotliDecompressAsync(inputBuffer);
          break;
          
        case 'zstd':
          const decompressedZstdUint8Array = await fzstdDecompress(inputBuffer);
          result = Buffer.from(decompressedZstdUint8Array);
          break;
          
        case 'deflate':
          result = await inflateAsync(inputBuffer);
          break;
          
        default:
          // Try all decompression methods for unknown encoding
          try { result = await gunzipAsync(inputBuffer); } 
          catch (e) {
            try { result = await brotliDecompressAsync(inputBuffer); } 
            catch (e) {
              try { 
                const res = await fzstdDecompress(inputBuffer);
                result = Buffer.from(res); 
              } 
              catch (e) {
                try { result = await inflateAsync(inputBuffer); } 
                catch (e) {
                  result = inputBuffer; // fallback to original
                }
              }
            }
          }
      }
    } else {
      // No content-encoding, check for magic bytes
      
      // Check for gzip magic bytes (0x1F 0x8B)
      if (inputBuffer.length > 2 && inputBuffer[0] === 0x1F && inputBuffer[1] === 0x8B) {
        try {
          result = await gunzipAsync(inputBuffer);
        } catch (error) {
          result = inputBuffer;
        }
      }
      
      // Check for zstd magic bytes (0x28 0xB5 0x2F 0xFD)
      else if (inputBuffer.length > 4 && 
          inputBuffer[0] === 0x28 && 
          inputBuffer[1] === 0xB5 && 
          inputBuffer[2] === 0x2F && 
          inputBuffer[3] === 0xFD) {
        try {
          const decompressed = await fzstdDecompress(inputBuffer);
          result = Buffer.from(decompressed);
        } catch (error) {
          result = inputBuffer;
        }
      }
      
      // Try brotli and deflate as a last resort
      else {
        try { result = await brotliDecompressAsync(inputBuffer); } 
        catch (e) {
          try { result = await inflateAsync(inputBuffer); } 
          catch (e) {
            result = inputBuffer; // if all fail, return original
          }
        }
      }
    }
    
    // Convert buffer to base64 string for serialization back to main thread
    return result.toString('base64');
  } catch (error) {
    throw new Error(`Decompression failed: ${error.message}`);
  }
}