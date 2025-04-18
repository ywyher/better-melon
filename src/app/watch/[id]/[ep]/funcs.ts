import { SubtitleSettings } from "@/lib/db/schema";
import { fetchSubtitles, parseSrt, parseVtt } from "@/lib/fetch-subs";
import { getExtension } from "@/lib/utils";
import { SkipTime } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { franc } from "franc-min";

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
      } catch (error) {
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