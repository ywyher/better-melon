import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { S3Client } from "@aws-sdk/client-s3";
import { Anime, AnimeEpisodeMetadata } from "@/types/anime";
import { MediaPlayerInstance } from "@vidstack/react";

export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(image: string | null) {
  if(image == 'pfp.png') {
    return "/images/pfp.png"
  }
  return image || "";
}

export const getExtension = (text: string) => {
  return text.split('.').pop()?.toLowerCase();
};

export const formatDescription = (desc: Anime['description'], max?: number) => {
    if (!desc) return "No description available.";
    const plainText = desc.replace(/<[^>]+>/g, '');
    return plainText.length > (max || 120) ? plainText.substring(0, (max || 120)) + "..." : plainText;
};

export const getTitle = (title: Anime['title']) => {
    return title.english || title.romaji || "Unknown Title";;
};

/**
 * Converts a camelCase string to Title Case with spaces
 * @param camelCase - A string in camelCase format (e.g., "oneTwo")
 * @returns The string converted to Title Case with spaces (e.g., "One Two")
 */
export function camelCaseToTitleCase(camelCase: string): string {
  if (!camelCase) return "";
  
  // Step 1: Insert a space before each capital letter
  const withSpaces = camelCase.replace(/([A-Z])/g, ' $1');
  
  // Step 2: Capitalize the first letter and trim any extra spaces
  const titleCase = withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
  
  return titleCase;
}

export function arraysAreEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}

export const convertFuzzyDateToDate = (fuzzyDateObj: { 
  year: number | null, 
  month: number | null, 
  day: number | null 
} | undefined) => {
  if (!fuzzyDateObj) {
    return null;
  }
  
  const { day, month, year } = fuzzyDateObj;
  
  if (day === null && month === null && year === null) {
    return null;
  }
  
  const safeYear = year !== null ? year : new Date().getFullYear();
  const safeMonth = month !== null ? month - 1 : 0; // JavaScript months are 0-indexed
  const safeDay = day !== null ? day : 1;
  
  return new Date(safeYear, safeMonth, safeDay);
}

export const downloadBase64Image = (base64Data: string, fileName: string, fileType = 'png') => {
  // Check if data already has the data URL prefix
  const dataUrl = base64Data.startsWith('data:') 
    ? base64Data 
    : `data:image/${fileType};base64,${base64Data}`;
  
  // Create default filename if not provided
  const defaultFileName = `screenshot-${new Date().getTime()}.${fileType}`;
  const finalFileName = fileName || defaultFileName;
  
  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = finalFileName;
  
  // Append to document, trigger click, and remove
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

/**
 * Maps screenshot naming pattern values by replacing placeholders with anime metadata
 * 
 * Supported placeholders:
 * - {title} - Name of the anime
 * - {counter} - Current episode number
 * - {random} - Random value to make sure each screenshot name is unique
 * - {timestamp} - Current timestamp
 * 
 * @param pattern - The naming pattern with placeholders
 * @param animeMetadata - Object containing anime episode metadata
 * @returns The pattern with placeholders replaced by actual values
 */
export const mapScreenshotNamingPatternValues = (pattern: string, animeMetadata: AnimeEpisodeMetadata): string => {
  console.log(`pattern`, pattern);
  console.log(`metadata`, animeMetadata);

  const randomString = Math.random().toString(36).substring(2, 6);
  const timestamp = Date.now();
  
  let result = pattern;
  
  // Replace {title} placeholder
  if (result.includes('{title}')) {
    result = result.replace(/{title}/g, animeMetadata.title.toLowerCase().replace(' ', '_') || '');
  }
  
  // Replace {counter} placeholder
  if (result.includes('{counter}')) {
    result = result.replace(/{counter}/g, animeMetadata.number?.toString() || '');
  }
  
  // Replace {random} placeholder
  if (result.includes('{random}')) {
    result = result.replace(/{random}/g, randomString);
  }
  
  // Replace {timestamp} placeholder
  if (result.includes('{timestamp}')) {
    result = result.replace(/{timestamp}/g, timestamp.toString());
  }
  
  return result;
};

export function takeSnapshot(player: MediaPlayerInstance, format: 'png' | 'jpeg' | 'webp' = defaultGeneralSettings.screenshotFormat, quality = 0.95) {
    const videoEl = player.el?.querySelector('video') as HTMLVideoElement;
    if (!videoEl) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    
    const mimeType = `image/${format}`;
    const dataURL = format === 'png' 
      ? canvas.toDataURL(mimeType)
      : canvas.toDataURL(mimeType, quality);

    return dataURL.split(',')[1];
}