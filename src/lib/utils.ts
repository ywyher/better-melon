import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { S3Client } from "@aws-sdk/client-s3";
import { Anime } from "@/types/anime";

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