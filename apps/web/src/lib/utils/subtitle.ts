import { TranscriptionsLookup } from "@/app/watch/[id]/[ep]/types";
import { excludedPos, subtitleFormats } from "@/lib/constants/subtitle";
import { SubtitleSettings } from "@/lib/db/schema";
import { FileSelectionError } from "@/lib/errors/player";
import { DelayStore } from "@/lib/stores/delay-store";
import { getExtension } from "@/lib/utils/utils";
import { ActiveSubtitleFile, Ruby, SubtitleFile, SubtitleFormat, SubtitleToken } from "@/types/subtitle";
import Kuroshiro from "@sglkc/kuroshiro";
import CustomKuromojiAnalyzer from "@/lib/subtitle/custom-kuromoji-analyzer";
import { getTokenizer } from "kuromojin";
import { cacheKeys } from "@/lib/constants/cache";
import { CacheKey } from "@/types";
import { parseSrt } from "@/lib/subtitle/parsers/srt";
import { parseVtt } from "@/lib/subtitle/parsers/vtt";
import { parseAss } from "@/lib/subtitle/parsers/ass";
import { franc } from 'franc-min'
import { Anime, AnimeSkipTime } from "@/types/anime";
import { EpisodeSubtitleTrack } from "@/types/episode";

export function getSubtitleCacheKey({
  source,
  isFile,
  animeId,
  episodeNumber,
  lastModified,
}: {
  source: string, 
  isFile: boolean,
  animeId: Anime['id'];
  episodeNumber: number
  lastModified?: number;
}): CacheKey {
  if (isFile && lastModified) {
    return cacheKeys.subtitle({
      name: `file-${source}-${lastModified}`,
      animeId,
      episodeNumber
    });
  }
  return cacheKeys.subtitle({
    name: source,
    animeId,
    episodeNumber
  });
}

export const getActiveSubtitleFile = ({
  preferredFormat,
  files,
  matchPattern
}: {
  files: SubtitleFile[], 
  preferredFormat: SubtitleSettings['preferredFormat']
  matchPattern?: SubtitleSettings['matchPattern']
}) => {
  const selectedFile = selectSubtitleFile({
    files: files,
    preferredFormat: preferredFormat,
    matchPattern
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

export const getEnglishSubtitleUrl = ({
  files,
  // url
  match
}: {
  files: EpisodeSubtitleTrack[]
  match: string | null
}) => {
  return files.find(
    (s: EpisodeSubtitleTrack) => 
      s.lang === 'English' && (!match || s.url == match)
  )?.url || "";
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
  
  console.log(`matchPattern`, matchPattern)
  
  // Helper function to check if file matches pattern
  const matchesPattern = (file: SubtitleFile): boolean => {
    if (!matchPattern) return false;
    
    // Try to use it as regex if it looks like one
    if (/[\\^$.*+?()[\]{}|]/.test(matchPattern)) {
      try {
        const regex = new RegExp(matchPattern, 'i');
        const result = regex.test(file.name);
        console.log(`Regex test result: ${result}`);

        if(!result) {
          throw new Error("Regex test failed")
        }

        return result;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Refex check faild."
        console.log(`Regex failed: ${msg}, falling back to string matching`);

        // If regex fails, fall back to string matching
        const result = file.name.toLowerCase().includes(matchPattern.toLowerCase());
        return result;
      }
    }
    
    // Simple string matching
    const result = file.name.toLowerCase().includes(matchPattern.toLowerCase());
    return result;
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
    const patternMatch = files.find((f) => matchesPattern(f));
    
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
  skipTimes: AnimeSkipTime[];
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
        (a: AnimeSkipTime, b: AnimeSkipTime) => a.interval.startTime - b.interval.startTime,
    );

    sortedSkipTimes.forEach((skipTime: AnimeSkipTime, index: number) => {
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
  const content = await file.text()
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

export const getTranscriptionsLookupKey = (from: number, to: number, delay: number = 0) => {
  // idk why its only works with - instead of + but sure
  return `${Math.floor(from - delay)}-${Math.floor(to - delay)}`
}

const findBestMatchingCue = (transcriptionMap: Map<string, any>, targetKey: string, tolerance: number = 3) => {
  // First try exact match
  const exactMatch = transcriptionMap.get(targetKey);
  if (exactMatch) return exactMatch;

  // Parse the target key to get time range
  const [fromStr, toStr] = targetKey.split('-');
  const targetFrom = parseInt(fromStr);
  const targetTo = parseInt(toStr);
  const targetMidpoint = (targetFrom + targetTo) / 2;

  let bestMatch = null;
  let bestScore = Infinity;

  // Search through all keys for the best overlap
  for (const [key, cue] of transcriptionMap) {
    const [keyFromStr, keyToStr] = key.split('-');
    const keyFrom = parseInt(keyFromStr);
    const keyTo = parseInt(keyToStr);
    const keyMidpoint = (keyFrom + keyTo) / 2;

    // Calculate overlap and distance
    const overlapStart = Math.max(targetFrom, keyFrom);
    const overlapEnd = Math.min(targetTo, keyTo);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    const distance = Math.abs(targetMidpoint - keyMidpoint);

    // Score based on overlap (higher is better) and distance (lower is better)
    const score = distance - overlap;

    // Only consider if within tolerance and has some overlap or is very close
    if (distance <= tolerance && (overlap > 0 || distance <= 1) && score < bestScore) {
      bestMatch = cue;
      bestScore = score;
    }
  }

  return bestMatch;
};

export const getSentencesForCue = (transcriptionLookup: TranscriptionsLookup, from: number, to: number, delay: DelayStore['delay']) => {
  const sentences = {
    kanji: null as string | null,
    kana: null as string | null,
    english: null as string | null,
  };

  const jpnKey = getTranscriptionsLookupKey(from, to)
  const engKey = getTranscriptionsLookupKey(from, to, delay.english)

  // Get Japanese (kanji) sentence
  const japaneseCue = transcriptionLookup.get('japanese')?.get(jpnKey);
  if (japaneseCue) {
    sentences.kanji = japaneseCue.content;
  }

  // Get Kana sentence
  const kanaCue = transcriptionLookup.get('hiragana')?.get(jpnKey);
  if (kanaCue) {
    sentences.kana = kanaCue.content;
  }

  // Get English sentence with fuzzy matching
  const englishMap = transcriptionLookup.get('english');
  if (englishMap) {
    const englishCue = findBestMatchingCue(englishMap, engKey, 3); // Allow up to 3 second tolerance for English
    if (englishCue) {
      sentences.english = englishCue.content;
    }
  }

  return sentences;
};

export const convertToKana = async (sentence: string) => {
  const tokenizer = await getTokenizer({ dicPath: '/dict' })
  const kuroshiro = new Kuroshiro();
  const analyzer = new CustomKuromojiAnalyzer({ tokenizer });
  await kuroshiro.init(analyzer);
  return await kuroshiro.convert(sentence, { to: "hiragana" });
}


// EX: <ruby>度<rp>(</rp><rt>ど</rt><rp>)</rp></ruby>し<ruby>難<rp>(</rp><rt>がた</rt><rp>)</rp></ruby>い
export const parseRuby = (html: string, includeNonRuby: boolean = true) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rubyElements = doc.querySelectorAll('ruby');
  
  if (rubyElements.length === 0) {
    return [{ baseText: html, rubyText: "" }];
  }
  
  const rubyPairs: { baseText: string; rubyText: string }[] = [];
  
  if (includeNonRuby) {
    const bodyElement = doc.body || doc.documentElement;
    const allNodes = Array.from(bodyElement.childNodes);
    
    allNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Non-ruby text node
        const text = node.textContent?.trim();
        if (text) {
          rubyPairs.push({ baseText: text, rubyText: "" });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'RUBY') {
        const rubyElement = node as Element;
        
        // everything except rt and rp elements
        const baseText = Array.from(rubyElement.childNodes)
          .filter(childNode => childNode.nodeType === Node.TEXT_NODE || 
                             (childNode.nodeType === Node.ELEMENT_NODE && 
                              childNode.nodeName !== 'RT' && childNode.nodeName !== 'RP'))
          .map(childNode => childNode.textContent)
          .join('');
        
        // rt elements
        const rtElement = rubyElement.querySelector('rt');
        const rubyText = rtElement?.textContent ?? "";
        
        rubyPairs.push({ baseText, rubyText });
      }
    });
  } else {
    rubyElements.forEach(rubyElement => {
      // everything except rt elements
      const baseText = Array.from(rubyElement.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE || 
                       (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'RT' && node.nodeName !== 'RP'))
        .map(node => node.textContent)
        .join('');
      
      // rt elements
      const rtElement = rubyElement.querySelector('rt');
      const rubyText = rtElement?.textContent ?? "";
      
      rubyPairs.push({ baseText, rubyText });
    });
  }
  
  return rubyPairs as Ruby[];
};