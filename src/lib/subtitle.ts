import { SubtitleCue, SubtitleTranscription, SubtitleFormat, SubtitleToken } from "@/types/subtitle";
import * as kuromoji from "kuromoji";
// @ts-expect-error - Kuroshiro lacks proper TypeScript typings
import Kuroshiro from "kuroshiro";
// @ts-expect-error - KuromojiAnalyzer lacks proper TypeScript typings
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import nlp from 'compromise';
import { SubtitleSettings } from "@/lib/db/schema";
import { getExtension } from "@/lib/utils";
import { SkipTime } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { franc } from "franc-min";

interface KuroshiroInstance {
  init: (analyzer: unknown) => Promise<void>;
  convert: (text: string, options?: { to?: string; transcription?: string }) => Promise<string>;
}

// Global instances to avoid re-initialization
let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let kuroshiro: KuroshiroInstance | null = null;

export async function fetchSubtitles(source: string | File) {
  // Handle URL string
  if (typeof source === 'string') {
    const response = await fetch(source);
    const text = await response.text();
    return text;
  } 
  // Handle File object
  else if (source instanceof File) {
    return await source.text()
  }
  
  throw new Error('Invalid source: must be a URL string or File object');
}

export async function parseSubtitleToJson({ 
  source, 
  format, 
  transcription = 'japanese' 
}: { 
  source: string | File, 
  format: SubtitleFormat, 
  transcription?: SubtitleTranscription 
}): Promise<SubtitleCue[]> {
  const content = await fetchSubtitles(source);

  let subtitles: SubtitleCue[] = [];

  // First parse the subtitle file to get basic cues
  switch (format) {
    case 'srt':
      subtitles = parseSrt(content);
      break;
    case "vtt":
      subtitles = parseVtt(content);
      break;
    default:
      throw new Error(`Unsupported subtitle format: ${format}`);
  }

  // Check if we have valid subtitles before processing
  if (!subtitles.length) {
    console.error("No subtitles found in file");
    return [];
  }

  // Now process the subtitles based on transcription type
  if (transcription === 'english') {
    return processEnglishSubtitles(subtitles);
  } else {
    // Initialize Japanese processors
    await initializeProcessors(transcription);
    
    // For Japanese, tokenize first
    const tokenizedSubs = tokenizeJapaneseSubtitles(subtitles);
    
    // If not Japanese, convert to the target transcription
    if (transcription !== 'japanese') {
      return processSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription);
    }
    
    return tokenizedSubs;
  }
}

async function initializeProcessors(transcription: SubtitleTranscription) {
  // Initialize tokenizer if not already done
  if (!tokenizer && transcription !== 'english') {
    tokenizer = await createTokenizer();
  }
  
  // Initialize kuroshiro if not already done (for non-japanese transcriptions only)
  if (!kuroshiro && transcription !== 'japanese' && transcription !== 'english') {
    kuroshiro = new Kuroshiro();
    const analyzer = new KuromojiAnalyzer({ dictPath: "/dict" });
    await kuroshiro?.init(analyzer);
  }
}

function createTokenizer(dicPath = "/dict") {
  return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
    kuromoji.builder({ dicPath })
      .build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
  });
}

function processEnglishSubtitles(subs: SubtitleCue[]): SubtitleCue[] {
  return subs.map(sub => {
    // Skip processing if content is empty
    if (!sub.content) {
      return sub;
    }
    
    const doc = nlp(sub.content);
    const terms = doc.terms().out('array');
    const tags = doc.terms().out('tags');
    
    const tokens = terms.map((term: string, index: number) => {
      const tagSet = tags[index] || {};
      const primaryPos = Object.keys(tagSet)[0] || "word";
      
      return {
        id: index,
        word_id: index,
        surface_form: term,
        pos: primaryPos,
        basic_form: doc.terms().eq(index).normalize().out('text'),
        word_type: "word",
        word_position: index,
        pos_detail_1: Object.keys(tagSet).join(','),
        pos_detail_2: "",
        pos_detail_3: "",
        conjugated_type: tagSet.Verb ? "verb" : "",
        conjugated_form: ""
      };
    });
    
    return {
      ...sub,
      tokens
    };
  });
}

function tokenizeJapaneseSubtitles(subs: SubtitleCue[]): SubtitleCue[] {
  if (!tokenizer) {
    throw new Error("Tokenizer not initialized for Japanese subtitles");
  }

  return subs.map(sub => ({
    ...sub,
    tokens: tokenizer!.tokenize(sub.content || '')
    .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
    .map((token, index) => ({
      ...token,
      id: `${sub.id}-${index}`
    })) as SubtitleToken[]
  }));
}

async function processSubtitlesForNonJapaneseTranscription(subs: SubtitleCue[], transcription: SubtitleTranscription) {
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized for transcription conversion");
  }
  
  return Promise.all(
    subs.map(async sub => {
      if (!sub.content) {
        return sub;
      }
      
      const convertedContent = await kuroshiro!.convert(sub.content, { to: transcription });
      
      // Converting the already tokenized text so we get consistent tokens across transcriptions
      const convertedTokens = sub.tokens
        ? await Promise.all(
            sub.tokens
              .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
              .map(async token => {
                const convertedToken = await kuroshiro!.convert(token.surface_form, { to: transcription });
                return {
                  ...token,
                  surface_form: convertedToken
                };
              })
          )
        : [];

      return {
        ...sub,
        original_content: sub.content,
        content: convertedContent,
        tokens: convertedTokens
      };
    })
  );
}

function cleanContent(content: string) {
  // Remove {\\an8}
  const cleanedContent = content.replace(/\{\\an\d+\}/g, '');
  
  return cleanedContent;
}

export function parseSrt(content: string) {
  const lines = content.split('\n');
  const result = [];
  
  let currentEntry: Partial<SubtitleCue> = {}
  let isReadingContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (Object.keys(currentEntry).length > 0) {
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    if (isReadingContent) {
      const initialContent = (currentEntry.content || '') + 
        (currentEntry.content ? ' ' : '') + line;

      currentEntry.content = cleanContent(initialContent);
      continue;
    }
    
    if (/^\d+$/.test(line) && !currentEntry.id) {
      currentEntry.id = parseInt(line);
      continue;
    }
    
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

    if (timestampMatch) {
      currentEntry.from = timestampMatch[1];
      currentEntry.to = timestampMatch[2];
      isReadingContent = true;
      continue;
    }
  }
  
  if (Object.keys(currentEntry).length > 0) {
    result.push(currentEntry);
  }
  
  return result as SubtitleCue[];
}

export function parseVtt(content: string) {
  const lines = content.split('\n');
  const result = [];
  let currentEntry: Partial<SubtitleCue> = {};
  let isReadingContent = false;
  let idCounter = 1;
  
  // Skip the WEBVTT header line
  let startIndex = 0;
  if (lines[0].includes('WEBVTT')) {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      if (Object.keys(currentEntry).length > 0 && currentEntry.from && currentEntry.to) {
        if (!currentEntry.id) {
          currentEntry.id = idCounter++;
        }
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    if (isReadingContent) {
      const initialContent = (currentEntry.content || '') +
        (currentEntry.content ? ' ' : '') + line;
      currentEntry.content = removeHtmlTags(initialContent);
      continue;
    }
    
    // Modified regex to handle both "HH:MM:SS.mmm" and "MM:SS.mmm" formats
    const timestampMatch = line.match(/(\d+:)?(\d{2}:\d{2}\.\d{3}) --> (\d+:)?(\d{2}:\d{2}\.\d{3})/);
    if (timestampMatch) {
      // Handle both formats and normalize to HH:MM:SS.mmm
      currentEntry.from = normalizeTimestamp(timestampMatch[1], timestampMatch[2]);
      currentEntry.to = normalizeTimestamp(timestampMatch[3], timestampMatch[4]);
      isReadingContent = true;
      continue;
    }
  }
  
  if (Object.keys(currentEntry).length > 0 && currentEntry.from && currentEntry.to) {
    if (!currentEntry.id) {
      currentEntry.id = idCounter++;
    }
    result.push(currentEntry);
  }
  
  return result as SubtitleCue[];
}

// Helper function to normalize timestamps to HH:MM:SS.mmm format
function normalizeTimestamp(hoursPart: string | undefined, minuteSecondsPart: string): string {
  if (hoursPart) {
    return hoursPart + minuteSecondsPart;
  } else {
    return "00:" + minuteSecondsPart;
  }
}

function removeHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
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