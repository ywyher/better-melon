import { Anime } from "@/types/anime";

export const formatDescription = (desc: Anime['description'], max?: number) => {
    if (!desc) return "No description available.";
    const plainText = desc.replace(/<[^>]+>/g, '');
    return plainText.length > (max || 120) ? plainText.substring(0, (max || 120)) + "..." : plainText;
};

export const getTitle = (title: Anime['title']) => {
    return title.english || title.romaji || "Unknown Title";;
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

