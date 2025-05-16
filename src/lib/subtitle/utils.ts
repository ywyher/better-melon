import { subtitleFormats } from "@/lib/constants/subtitle";
import { SubtitleSettings } from "@/lib/db/schema";
import { fetchSubtitles, parseSrt, parseVtt } from "@/lib/subtitle/parse";
import { getExtension } from "@/lib/utils";
import { AnimeStreamingLinks, SkipTime } from "@/types/anime";
import { ActiveSubtitleFile, SubtitleFile, SubtitleFormat } from "@/types/subtitle";
import {franc} from 'franc-min'

export const getActiveSubtitleFile = (subtitleFiles: SubtitleFile[]) => {
  const selectedFile = selectSubtitleFile({
    files: subtitleFiles,
    preferredFormat: 'srt'
  })

  return {
    source: 'remote',
    file: {
      name: selectedFile?.name,
      url: selectedFile?.url,
      last_modified: selectedFile?.last_modified,
      size: selectedFile?.size
    }
  }
}

export const getEnglishSubtitleUrl = (tracks: AnimeStreamingLinks['tracks']) => {
  return tracks.find(
    (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
  )?.file || "";
}

// Helper function to normalize timestamps to HH:MM:SS.mmm format
export function normalizeTimestamp(hoursPart: string | undefined, minuteSecondsPart: string): string {
  if (hoursPart) {
    return hoursPart + minuteSecondsPart;
  } else {
    return "00:" + minuteSecondsPart;
  }
}

export function removeHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export function timestampToSeconds({ format, timestamp, delay = 0 }: { format: SubtitleFormat, timestamp: string, delay?: number }): number {
  switch (format) {
      case 'srt':
        // the + .10 somehow makes it feels more smooth idk why so why not
        return srtTimestampToSeconds(timestamp) + delay + .10;
      break;
      case "vtt":
        return vttTimestampToSeconds(timestamp) + delay + .10;
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

export const filterSubtitleFiles = (files: SubtitleFile[]) => {
  const subtitleExtensions = ['srt', 'ass', 'vtt'];
  
  return files.filter(file => {
    const filename = file.name;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    const isSubtitleFile = extension && subtitleExtensions.includes(extension);
    
    if (!isSubtitleFile) return false;
    
    // Check for patterns that indicate multiple episodes
    const containsMultipleEpisodes = (
      // Pattern like "01-04" indicating episode range
      /\d+-\d+/.test(filename) ||
      // Other potential patterns for multiple episodes
      filename.includes("(1-") ||
      filename.includes(" 1-") ||
      /E\d+-E\d+/i.test(filename)  // Pattern like "E01-E04"
    );
    
    // Return true only if it's a subtitle file AND doesn't contain multiple episodes
    return !containsMultipleEpisodes;
  });
};

export const selectSubtitleFile = ({ files, preferredFormat, matchPattern }: {
  files: SubtitleFile[]
  preferredFormat?: SubtitleSettings['preferredFormat']
  matchPattern?: SubtitleSettings['matchPattern']
}) => {
  if (!files || files.length === 0) {
    return null;
  }

  // Helper function to check if file matches pattern
  const matchesPattern = (file: SubtitleFile) => {
    if (!matchPattern) return false;
    
    // Try to use it as regex if it looks like one
    if (/[\\^$.*+?()[\]{}|]/.test(matchPattern)) {
      try {
        const regex = new RegExp(matchPattern, 'i');
        return regex.test(file.name);
      } catch {
        // If regex fails, fall back to string matching
        return file.name.toLowerCase().includes(matchPattern.toLowerCase());
      }
    }
    
    // Simple string matching
    return file.name.toLowerCase().includes(matchPattern.toLowerCase());
  };
  
  // First priority: Check if there's a file matching the pattern
  if (matchPattern) {
    // If we want to match pattern in preferred format first
    const patternMatchInPreferredFormat = files.find(file => 
      matchesPattern(file) && getExtension(file.name) === preferredFormat
    );
    
    if (patternMatchInPreferredFormat) {
      return patternMatchInPreferredFormat;
    }
    
    // If no match in preferred format, try any file matching the pattern
    const patternMatch = files.find(matchesPattern);
    if (patternMatch) {
      return patternMatch;
    }
  }

  const preferredFormatFiles = files.filter(file => 
    getExtension(file.name) === preferredFormat
  );
  
  if (preferredFormatFiles.length > 0) {
    return preferredFormatFiles[0];
  }
  
  // Third priority: Return first subtitle file of any supported format
  const supportedFormats = ["srt", "vtt", "ass"];
  const supportedFile = files.find(file => 
    supportedFormats.includes(getExtension(file.name) || '')
  );
  
  if (supportedFile) {
    return supportedFile;
  }
  
  // Last resort: Return first file (regardless of extension)
  return files[0];
};

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

type GenerateWebVTTFromSkipTimesProps = {
  skipTimes: SkipTime[];
  totalDuration: number;
  episode: {
    title: string;
    number: number
  }
}

export function generateWebVTTFromSkipTimes({
    skipTimes,
    totalDuration,
    episode
}: GenerateWebVTTFromSkipTimesProps): string {
    let vttString = 'WEBVTT\n\n';
    let previousEndTime = 0;

    const sortedSkipTimes = skipTimes.sort(
        (a: SkipTime, b: SkipTime) => a.interval.startTime - b.interval.startTime,
    );

    sortedSkipTimes.forEach((skipTime: SkipTime, index: number) => {
        const { startTime, endTime } = skipTime.interval;
        const skipType =
        skipTime.skipType.toUpperCase() === 'OP' ? 'Opening' : 'Outro';

        // Insert default title chapter before this skip time if there's a gap
        if (previousEndTime < startTime) {
            vttString += `${formatTime(previousEndTime)} --> ${formatTime(startTime)}\n`;
            vttString += `${episode.title} - Episode ${episode.number}\n\n`;
        }

        // Insert this skip time
        vttString += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        vttString += `${skipType}\n\n`;
        previousEndTime = endTime;

        // Insert default title chapter after the last skip time
        if (index === sortedSkipTimes.length - 1 && endTime < totalDuration) {
            vttString += `${formatTime(endTime)} --> ${formatTime(totalDuration)}\n`;
            vttString += `${episode.title} - Episode ${episode.number}\n\n`;
        }
    });

    return vttString;
}

export async function isFileJpn(file: File) {
  const content = await fetchSubtitles(file)

  let parsed
  if(file.name.split('.').pop() == 'srt') {
    parsed = parseSrt(content)
  }else if(file.name.split('.').pop() == 'vtt') {
    parsed = parseVtt(content)
  }

  if(!parsed) return;

  const toBeTested = parsed?.slice(0, Math.ceil(parsed?.length / 2))
    .map((cue) => cue.content)
    .join(' ')

  const result = franc(toBeTested)

  return result == 'jpn' ? true : false
}

export function getSubtitleSource(
  isEnglish: boolean,
  englishSubtitleUrl: string,
  activeSubtitleFile: ActiveSubtitleFile | null
): string | File {
  if (isEnglish) {
    if (!englishSubtitleUrl) throw new Error("Missing English subtitle URL");
    return englishSubtitleUrl;
  }
  if (!activeSubtitleFile) throw new Error("Missing active subtitle file");

  const source = activeSubtitleFile.source === 'remote'
  ? activeSubtitleFile.file.url
  : activeSubtitleFile.file;
  
  return source 
}

export function getSubtitleFormat(
  isEnglish: boolean,
  englishSubtitleUrl: string,
  activeSubtitleFile: ActiveSubtitleFile | null
): SubtitleFormat {
  let ext: string | undefined = undefined;

  if (isEnglish) {
    if (!englishSubtitleUrl) throw new Error("Missing English subtitle URL");
    ext = getExtension(englishSubtitleUrl);
  } else {
    if (!activeSubtitleFile) throw new Error("Missing active subtitle file");

    ext = activeSubtitleFile.source === "remote"
      ? getExtension(activeSubtitleFile.file.url)
      : getExtension(activeSubtitleFile.file.name);
  }

  if (!ext || !subtitleFormats.includes(ext as SubtitleFormat)) {
    throw new Error(`Invalid subtitle format: ${ext}`);
  }

  return ext as SubtitleFormat;
}