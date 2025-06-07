import { TranscriptionsLookup } from "@/app/watch/[id]/[ep]/types";
import { excludedPos, subtitleFormats } from "@/lib/constants/subtitle";
import { SubtitleSettings } from "@/lib/db/schema";
import { FileSelectionError } from "@/lib/errors/player";
import { fetchSubtitles, parseAss, parseSrt, parseVtt } from "@/lib/subtitle/parse";
import { getExtension } from "@/lib/utils";
import { AnimeStreamingLinks, SkipTime } from "@/types/anime";
import { ActiveSubtitleFile, SubtitleCue, SubtitleFile, SubtitleFormat, SubtitleToken, SubtitleTranscription } from "@/types/subtitle";
import {franc} from 'franc-min'

export const getActiveSubtitleFile = (subtitleFiles: SubtitleFile[], preferredFormat: SubtitleSettings['preferredFormat']) => {
  const selectedFile = selectSubtitleFile({
    files: subtitleFiles,
    preferredFormat: preferredFormat
  })

  if(!selectedFile) throw new FileSelectionError()

  return {
    source: 'remote',
    file: {
      name: selectedFile.name,
      url: selectedFile.url,
      last_modified: selectedFile.last_modified,
      size: selectedFile.size
    }
  } as ActiveSubtitleFile
}

export const getEnglishSubtitleUrl = (tracks: AnimeStreamingLinks['tracks']) => {
  return tracks.find(
    (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
  )?.file || "";
}

export function removeTags(content: string) {
  // Remove anything between curly brackets {}
  const cleanedContent = content.replace(/\{[^}]*\}/g, '');
  return cleanedContent;
}

export function removeHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export function timestampToSeconds(timestamp: string, delay: number = 0): number {
  if(!timestamp) return 0;
  const cleanTimestamp = timestamp.trim();

  console.log(`timestamp`, timestamp)

  // Extract hours, minutes, seconds, and milliseconds using regex
  // This handles formats like "00:00:00,000", "00:00:00.000", and "00:00:00,-000"
  const regex = /(\d{2}):(\d{2}):(\d{2})[,.](-?\d+)/;
  const match = cleanTimestamp.match(regex);
  
  if (!match) {
    throw new Error(`Invalid timestamp format: ${timestamp}`);
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
  return (Math.round(totalSeconds * 1000) / 1000) + delay + 0.10; // the + .10 somehow makes it feels more smooth idk why so why not
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
  const format = getExtension(file.name)

  let parsed
  
  switch (format) {
    case 'srt':
      parsed = parseSrt(content, 'japanese');
    break;
    case 'vtt':
      parsed = parseVtt(content, 'japanese');
    break;
    case 'ass':
      parsed = parseAss(content, 'japanese');
    break;
    default:
      throw new Error(`Unsupported subtitle format: ${format}`);
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

export function isTokenExcluded(token: SubtitleToken) {
  return excludedPos.includes(token.pos)
  || excludedPos.includes(token.pos_detail_1) // for numbers
}

export const getTranscriptionsLookupKey = (from: number, to: number) => {
  return `${Math.floor(from)}-${Math.floor(to)}`;
};

export const findBestMatchingCue = (
  cueMap: Map<string, SubtitleCue>, 
  targetFrom: number, 
  targetTo: number,
  tolerance: number = 1.0 // 1 second tolerance
): SubtitleCue | null => {
  let bestMatch: SubtitleCue | null = null;
  let bestScore = Infinity;

  for (const cue of cueMap.values()) {
    const fromDiff = Math.abs(cue.from - targetFrom);
    const toDiff = Math.abs(cue.to - targetTo);
    const totalDiff = fromDiff + toDiff;

    // Only consider cues within tolerance
    if (fromDiff <= tolerance && toDiff <= tolerance && totalDiff < bestScore) {
      bestScore = totalDiff;
      bestMatch = cue;
    }
  }

  return bestMatch;
};

export const getSentencesForCue = (
  transcriptionLookup: TranscriptionsLookup, 
  from: number, 
  to: number
) => {
  const sentences = {
    kanji: null as string | null,
    kana: null as string | null,
    english: null as string | null,
  };

  // Get Japanese (kanji) sentence
  const japaneseCueMap = transcriptionLookup.get('japanese');
  if (japaneseCueMap) {
    const japaneseCue = findBestMatchingCue(japaneseCueMap, from, to);
    if (japaneseCue) {
      sentences.kanji = japaneseCue.content;
    }
  }

  // Get Kana sentence - exact match since it's from same file as Japanese
  const kanaCue = transcriptionLookup.get('hiragana')?.get(getTranscriptionsLookupKey(from, to));
  if (kanaCue) {
    sentences.kana = kanaCue.content;
  }

  // Get English sentence
  const englishCueMap = transcriptionLookup.get('english');
  if (englishCueMap) {
    const englishCue = findBestMatchingCue(englishCueMap, from, to);
    if (englishCue) {
      sentences.english = englishCue.content;
    }
  }

  return sentences;
};