import Kuroshiro from "@sglkc/kuroshiro";
import type { SubtitleCue, SubtitleTranscription, SubtitleFormat, SubtitleToken } from "@/types/subtitle";
import {getTokenizer as getTokenizerKuromojin, type Tokenizer} from "kuromojin";
import CustomKuromojiAnalyzer from "./custom-kuromoji-analyzer";
import { normalizeTimestamp, removeHtmlTags } from "@/lib/subtitle/utils";
import nlp from 'compromise';

type CacheKey = string; // URL or file name
interface SubtitleCache {
  content: string;
  parsedSubtitles: SubtitleCue[];
  tokenizedSubtitles: SubtitleCue[];
  lastAccessed: number;
}
const subtitleCache = new Map<CacheKey, SubtitleCache>();

// Track content currently being fetched to avoid redundant parallel fetches
const fetchingInProgress = new Map<CacheKey, Promise<string>>();

// Track tokenization to avoid redundant parallel fetches
const tokenizationInProgress = new Map<CacheKey, Promise<SubtitleCue[]>>();

let tokenizer: Tokenizer | null = null;
let tokenizerPromise: Promise<void> | null = null;

export async function initializeTokenizer(name?: string) {
  if(tokenizer) {
    console.info(`~Tokenizer already exists`)
    return tokenizer
  };
  
  if(tokenizerPromise) {
    console.info(`~${name}-Waiting for existing tokenizer initialization`);
    await tokenizerPromise;
    return;
  }
  
  const tokenizerStart = performance.now();
  
  // Store the promise to prevent parallel initialization
  tokenizerPromise = (async () => {
    tokenizer = await getTokenizerKuromojin({ dicPath: '/dict' });
    const tokenizerEnd = performance.now();
    console.info(`~${name}-initializeTokenizers took --> ${tokenizerEnd - tokenizerStart}ms`);
  })();
  
  await tokenizerPromise;

  return tokenizer;
}

export function isTokenizerInitialized() {
  return tokenizer ? true : false
}

function getCacheKey(source: string | File): CacheKey {
  if (typeof source === 'string') {
    return source;
  } else {
    return `file-${source.name}-${source.lastModified}`;
  }
}

export async function fetchSubtitles(source: string | File) {
  const cacheKey = getCacheKey(source);
  const sourceType = typeof source === 'string' ? 'url' : 'file';

  if (subtitleCache.has(cacheKey) && subtitleCache.get(cacheKey)!.content) {
    console.info(`Using cached subtitle content for ${sourceType}: ${cacheKey}`);
    subtitleCache.get(cacheKey)!.lastAccessed = Date.now();
    return subtitleCache.get(cacheKey)!.content;
  }
  
  if (fetchingInProgress.has(cacheKey)) {
    console.info(`Waiting for in-progress fetch of ${sourceType}: ${cacheKey}`);
    return await fetchingInProgress.get(cacheKey)!;
  }
  
  console.info(`Fetching subtitle content for ${sourceType}: ${cacheKey}`);
  
  let fetchPromise: Promise<string>;
  
  // Handle URL string
  if (typeof source === 'string') {
    fetchPromise = fetch(source)
      .then(response => response.text())
      .then(text => {
        // Initialize or update cache entry
        if (!subtitleCache.has(cacheKey)) {
          subtitleCache.set(cacheKey, {
            content: text,
            parsedSubtitles: [],
            tokenizedSubtitles: [],
            lastAccessed: Date.now()
          });
        } else {
          const cache = subtitleCache.get(cacheKey)!;
          cache.content = text;
          cache.lastAccessed = Date.now();
        }
        
        fetchingInProgress.delete(cacheKey);
        return text;
      })
      .catch(error => {
        fetchingInProgress.delete(cacheKey);
        throw error;
      });
  } 
  // Handle File object
  else if (source instanceof File) {
    fetchPromise = source.text()
      .then(text => {
        // Initialize or update cache entry
        if (!subtitleCache.has(cacheKey)) {
          subtitleCache.set(cacheKey, {
            content: text,
            parsedSubtitles: [],
            tokenizedSubtitles: [],
            lastAccessed: Date.now()
          });
        } else {
          const cache = subtitleCache.get(cacheKey)!;
          cache.content = text;
          cache.lastAccessed = Date.now();
        }
        
        fetchingInProgress.delete(cacheKey);
        return text;
      })
      .catch(error => {
        fetchingInProgress.delete(cacheKey);
        throw error;
      });
  } else {
    throw new Error('Invalid source: must be a URL string or File object');
  }
  
  // Add to in-progress fetches
  fetchingInProgress.set(cacheKey, fetchPromise);
  return await fetchPromise;
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
  const cacheKey = getCacheKey(source);
  console.debug(`cacheKey`, subtitleCache.get(cacheKey))
  
  const fetchStart = performance.now();
  const content = await fetchSubtitles(source);
  const fetchEnd = performance.now();
  console.info(`~${transcription}-fetchSubtitles took --> ${fetchEnd - fetchStart}ms`);

  let subtitles: SubtitleCue[] = [];
    
  // Check if we have parsed subtitles in cache
  if (subtitleCache.has(cacheKey) && subtitleCache.get(cacheKey)!.parsedSubtitles.length > 0) {
    console.info(`~${transcription} Using cached parsed subtitles`);
    subtitles = subtitleCache.get(cacheKey)!.parsedSubtitles;
  } else {
    console.info(`~${transcription} Parsing subtitles (not in cache)`);
    switch (format) {
      case 'srt':
        const parseSrtStart = performance.now();
        subtitles = parseSrt(content, transcription);
        const parseSrtEnd = performance.now();
        console.info(`~${transcription}-parse-srt took --> ${parseSrtEnd - parseSrtStart}ms`);
        break;
      case 'vtt':
        const parseVttStart = performance.now();
        subtitles = parseVtt(content, transcription);
        const parseVttEnd = performance.now();
        console.info(`~${transcription}-parse-vtt took --> ${parseVttEnd - parseVttStart}ms`);
        break;
      default:
        throw new Error(`Unsupported subtitle format: ${format}`);
    }

    if (!subtitles.length) {
      console.error("No subtitles found in file");
      return [];
    }
    
    // Save parsed subtitles to cache
    if (subtitleCache.has(cacheKey)) {
      console.info(`~${transcription} Saving parsed subtitles to cache`);
      subtitleCache.get(cacheKey)!.parsedSubtitles = subtitles;
    }
  }

  if (transcription === 'english') {
    const processStart = performance.now();
    const processedSubs = processEnglishSubtitles(subtitles);
    const processEnd = performance.now();
    console.info(`~${transcription}-processEnglishSubtitles took --> ${processEnd - processStart}ms`);
    return processedSubs;
  }
  
  // Check if tokenized subtitles are in cache
  if (subtitleCache.has(cacheKey) && subtitleCache.get(cacheKey)!.tokenizedSubtitles.length > 0) {
    console.info(`~${transcription} Using cached tokenized subtitles`);
    const tokenizedSubs = subtitleCache.get(cacheKey)!.tokenizedSubtitles;
    
    // If not pure Japanese, convert to the target transcription
    if (transcription !== 'japanese') {
      const conversionStart = performance.now();
      const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription);
      const conversionEnd = performance.now();
      console.info(`~${transcription}-convertNonJapaneseSubtitles took --> ${conversionEnd - conversionStart}ms`);
      return convertedSubs;
    }
    
    return tokenizedSubs;
  }
  
  // Check if this resource is already being tokenized by another call
  if (tokenizationInProgress.has(cacheKey)) {
    console.info(`Waiting for in-progress tokenization of ${transcription} for ${cacheKey}`);
    const tokenizedSubs = await tokenizationInProgress.get(cacheKey)!;
    
    // If not pure Japanese, convert to the target transcription
    if (transcription !== 'japanese') {
      const conversionStart = performance.now();
      const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription);
      const conversionEnd = performance.now();
      console.info(`~${transcription}-convertNonJapaneseSubtitles took --> ${conversionEnd - conversionStart}ms`);
      return convertedSubs;
    }
    
    return tokenizedSubs;
  }

  // Start new tokenization process
  const tokenizationPromise: Promise<SubtitleCue[]> = tokenizeJapaneseSubtitles(subtitles, transcription)
    .then(subs => {
      // Save to cache
      if (subtitleCache.has(cacheKey)) {
        const cache = subtitleCache.get(cacheKey)!;
        cache.tokenizedSubtitles = subs;
        cache.lastAccessed = Date.now();
      }
      
      tokenizationInProgress.delete(cacheKey);
      return subs;
    })
    .catch(error => {
      tokenizationInProgress.delete(cacheKey);
      throw new Error(error);
    });

  tokenizationInProgress.set(cacheKey, tokenizationPromise);
  
  const tokenizedSubs = await tokenizationPromise;
  
  if (transcription !== 'japanese') {
    const conversionStart = performance.now();
    const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription);
    const conversionEnd = performance.now();
    console.info(`~${transcription}-convertNonJapaneseSubtitles took --> ${conversionEnd - conversionStart}ms`);
    return convertedSubs;
  }

  return tokenizedSubs;
}

export function clearSubtitleCache(source?: string | File) {
  if (source) {
    const cacheKey = getCacheKey(source);
    subtitleCache.delete(cacheKey);
    fetchingInProgress.delete(cacheKey);
    tokenizationInProgress.delete(cacheKey);
  } else {
    subtitleCache.clear();
    fetchingInProgress.clear();
    tokenizationInProgress.clear();
  }
}

function processEnglishSubtitles(subs: SubtitleCue[]): SubtitleCue[] {
  return subs.map(sub => {
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

async function tokenizeJapaneseSubtitles(subs: SubtitleCue[], transcription: SubtitleTranscription) {
  await initializeTokenizer(transcription);

  if(!tokenizer) throw new Error("Tokenizer is null");
  
  const results = [];

  for (const sub of subs) {
    const rawTokens = tokenizer.tokenize(sub.content || '');
    
    const tokens = rawTokens
      .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
      .map((token, index) => ({
        ...token,
        id: `${sub.id}-${index}`
      })) as SubtitleToken[];
    
    results.push({
      ...sub,
      tokens
    });
  }
  
  return results;
}

async function convertSubtitlesForNonJapaneseTranscription(subs: SubtitleCue[], transcription: SubtitleTranscription) {
  const kuroshiroStart = performance.now();
  const kuroshiro = new Kuroshiro();
  const analyzer = new CustomKuromojiAnalyzer({ tokenizer });
  await kuroshiro.init(analyzer);
  const kuroshiroEnd = performance.now();
  console.info(`~${transcription}-kuroshiroInitialization took: ${(kuroshiroEnd - kuroshiroStart).toFixed(2)}ms`);
  
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized for transcription conversion");
  }

  return Promise.all(
    subs.map(async sub => {
      if (!sub.content || !kuroshiro) {
        return sub;
      }
      
      const convertedContent = await kuroshiro.convert(sub.content, { 
        to: transcription,
        mode: transcription === 'romaji' ? 'spaced' : 'normal'
      });
      
      // Converting the already tokenized text so we get consistent tokens across transcriptions
      const convertedTokens = sub.tokens
        ? await Promise.all(
            sub.tokens
              .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
              .map(async token => {
                const convertedToken = await kuroshiro.convert(token.surface_form, { to: transcription });
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

export function parseSrt(content: string, transcription: SubtitleTranscription) {
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

    currentEntry.transcription = transcription;
    
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

export function parseVtt(content: string, transcription: SubtitleTranscription) {
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

    currentEntry.transcription == transcription
    
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