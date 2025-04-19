import { Anime } from "@/types/anime";
import { SubtitleFormat } from "@/types/subtitle";
import { MediaPlayerInstance } from "@vidstack/react";

export const formatDescription = (desc: Anime['description'], max?: number) => {
    if (!desc) return "No description available.";
    const plainText = desc.replace(/<[^>]+>/g, '');
    return plainText.length > (max || 120) ? plainText.substring(0, (max || 120)) + "..." : plainText;
};

export const getTitle = (title: Anime['title']) => {
    return title.english || title.romaji || "Unknown Title";;
}

export function timestampToSeconds({ format, timestamp }: { format: SubtitleFormat, timestamp: string }): number {
    switch (format) {
        case 'srt':
            return srtTimestampToSeconds(timestamp);
        break;
        case "vtt":
            return vttTimestampToSeconds(timestamp);
        break;
        default:
            return 0;
        break;
    }
}

/**
 * Converts an SRT timestamp to seconds
 * Handles various SRT timestamp formats including:
 * - 00:00:00,000 (standard format)
 * - 00:00:00,-000 (negative milliseconds in some cases)
 * - 00:00:00.000 (period instead of comma, sometimes used)
 * 
 * @param timestamp - SRT timestamp in format "00:00:00,000" or similar variations
 * @returns The timestamp converted to seconds as a number
 */
export function srtTimestampToSeconds(timestamp: string): number {
    if(!timestamp) return 0;

    const cleanTimestamp = timestamp.trim();
    
    // Extract hours, minutes, seconds, and milliseconds using regex
    // This handles formats like "00:00:00,000", "00:00:00.000", and "00:00:00,-000"
    const regex = /(\d{2}):(\d{2}):(\d{2})[,.](-?\d+)/;
    const match = cleanTimestamp.match(regex);
    
    if (!match) {
      throw new Error(`Invalid SRT timestamp format: ${timestamp}`);
    }
    
    // Extract components
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const milliseconds = parseInt(match[4], 10);
    
    // Convert to seconds
    const totalSeconds = 
      hours * 3600 + 
      minutes * 60 + 
      seconds + 
      milliseconds / 1000;
    
    // Return rounded to 3 decimal places for millisecond precision
    return Math.round(totalSeconds * 1000) / 1000;
}

/**
 * Converts a WebVTT timestamp to seconds
 * Handles various VTT timestamp formats including:
 * - 00:00:00.000 (standard format with hours)
 * - 00:00.000 (short format without hours)
 * 
 * @param timestamp - VTT timestamp in format "00:00:00.000" or "00:00.000"
 * @returns The timestamp converted to seconds as a number
 */
export function vttTimestampToSeconds(timestamp: string): number {
  if(!timestamp) return 0;

  const cleanTimestamp = timestamp.trim();
  
  // Check if the timestamp includes hours (00:00:00.000) or is in short format (00:00.000)
  const hasHours = (cleanTimestamp.match(/:/g) || []).length > 1;
  
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let milliseconds = 0;
  
  if (hasHours) {
      // Format: 00:00:00.000 (with hours)
      const regex = /(\d+):(\d{2}):(\d{2})\.(\d{3})/;
      const match = cleanTimestamp.match(regex);
      
      if (!match) {
          throw new Error(`Invalid VTT timestamp format: ${timestamp}`);
      }
      
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      seconds = parseInt(match[3], 10);
      milliseconds = parseInt(match[4], 10);
  } else {
      // Format: 00:00.000 (without hours)
      const regex = /(\d+):(\d{2})\.(\d{3})/;
      const match = cleanTimestamp.match(regex);
      
      if (!match) {
          throw new Error(`Invalid VTT timestamp format: ${timestamp}`);
      }
      
      minutes = parseInt(match[1], 10);
      seconds = parseInt(match[2], 10);
      milliseconds = parseInt(match[3], 10);
  }
  
  // Convert to seconds
  const totalSeconds = 
      hours * 3600 + 
      minutes * 60 + 
      seconds + 
      milliseconds / 1000;
  
  // Return rounded to 3 decimal places for millisecond precision
  return Math.round(totalSeconds * 1000) / 1000;
}

export function takeSnapshot(player: MediaPlayerInstance) {
    const videoEl = player.el?.querySelector('video') as HTMLVideoElement;
    if (!videoEl) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');

    // Extract the base64 data (remove the "data:image/png;base64," part)
    return dataURL.split(',')[1];
}