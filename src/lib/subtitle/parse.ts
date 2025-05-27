import Kuroshiro from "@sglkc/kuroshiro";
import type { SubtitleCue, SubtitleTranscription, SubtitleFormat, SubtitleToken } from "@/types/subtitle";
import {getTokenizer as getTokenizerKuromojin, type Tokenizer} from "kuromojin";
import CustomKuromojiAnalyzer from "./custom-kuromoji-analyzer";
import { removeHtmlTags, removeTags, timestampToSeconds } from "@/lib/subtitle/utils";
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
        case 'ass':
        const parseAssStart = performance.now();
        subtitles = parseAss(content, transcription);
        const parseAssEnd = performance.now();
        console.info(`~${transcription}-parse-ass took --> ${parseAssEnd - parseAssStart}ms`);
      break;
      default:
        throw new Error(`Unsupported subtitle format: ${format}`);
    }

    if (!subtitles.length) {
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
      transcription: 'english',
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
        transcription: transcription,
        original_content: sub.content,
        content: convertedContent,
        tokens: convertedTokens
      };
    })
  );
}

export function parseSrt(content: string, transcription: SubtitleTranscription) {
  console.log('Parsing SRT content...');
  const lines = content.split('\n');
  const result = [];

  let currentEntry: Partial<SubtitleCue> = {};
  let isReadingContent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Line ${i}: "${line}"`);

    if (line === '') {
      if (Object.keys(currentEntry).length > 0) {
        console.log('Pushing entry:', currentEntry);
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      } else {
        console.log('Skipping empty line');
      }
      continue;
    }

    currentEntry.transcription = transcription;

    if (isReadingContent) {
      const initialContent = (currentEntry.content || '') + 
        (currentEntry.content ? ' ' : '') + line;

      currentEntry.content = removeTags(initialContent);
      console.log(`Appending content: "${currentEntry.content}"`);
      continue;
    }

    if (/^\d+$/.test(line) && !currentEntry.id) {
      currentEntry.id = parseInt(line);
      console.log(`Parsed ID: ${currentEntry.id}`);
      continue;
    }

    // REGEX to handle both "HH:MM:SS.mmm"
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

    if (timestampMatch) {
      currentEntry.from = timestampToSeconds(timestampMatch[1]);
      currentEntry.to = timestampToSeconds(timestampMatch[2]);
      isReadingContent = true;
      console.log(`Parsed timestamps: from=${currentEntry.from}, to=${currentEntry.to}`);
      continue;
    }

    console.warn(`Unrecognized line format: "${line}"`);
  }

  if (Object.keys(currentEntry).length > 0) {
    console.log('Pushing final entry:', currentEntry);
    result.push(currentEntry);
  }

  console.log('Finished parsing. Total entries:', result);
  return result as SubtitleCue[];
}

export function parseVtt(content: string, transcription: SubtitleTranscription) {
  console.log('Parsing VTT content...');
  const lines = content.split('\n');
  const result = [];

  let currentEntry: Partial<SubtitleCue> = {};
  let isReadingContent = false;
  let idCounter = 1;

  let startIndex = 0;
  if (lines[0].includes('WEBVTT')) {
    console.log('Skipping WEBVTT header');
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Line ${i}: "${line}"`);

    if (line === '') {
      if (Object.keys(currentEntry).length > 0 && currentEntry.from && currentEntry.to) {
        if (!currentEntry.id) {
          currentEntry.id = idCounter++;
          console.log(`Assigned ID: ${currentEntry.id}`);
        }
        console.log('Pushing entry:', currentEntry);
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      } else {
        console.log('Skipping empty line');
      }
      continue;
    }

    currentEntry.transcription = transcription;

    if (isReadingContent) {
      const initialContent = (currentEntry.content || '') +
        (currentEntry.content ? ' ' : '') + line;
      currentEntry.content = removeHtmlTags(initialContent);
      console.log(`Appending content: "${currentEntry.content}"`);
      continue;
    }

    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);

    if (timestampMatch) {
      currentEntry.from = timestampToSeconds(timestampMatch[1]);
      currentEntry.to = timestampToSeconds(timestampMatch[2]);
      isReadingContent = true;
      console.log(`Parsed timestamps: from=${currentEntry.from}, to=${currentEntry.to}`);
      continue;
    }

    console.warn(`Unrecognized line format: "${line}"`);
  }

  if (Object.keys(currentEntry).length > 0 && currentEntry.from && currentEntry.to) {
    if (!currentEntry.id) {
      currentEntry.id = idCounter++;
      console.log(`Assigned final ID: ${currentEntry.id}`);
    }
    console.log('Pushing final entry:', currentEntry);
    result.push(currentEntry);
  }

  console.log('Finished parsing. Total entries:', result);
  return result as SubtitleCue[];
}

export function parseAss(content: string, transcription: SubtitleTranscription) {
  console.log('Parsing ASS content...');
  const lines = content.split('\n');
  const result = [];
  let idCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Line ${i}: "${line}"`);

    if (line === '') {
      console.log('Skipping empty line');
      continue;
    }

    if (line.startsWith("Dialogue:")) {
      console.log('Found dialogue line');

      const parts = line.split(',');

      if (parts.length >= 10) {
        const startTime = parts[1]; // e.g., "0:00:07.27"
        const endTime = parts[2];   // e.g., "0:00:11.64"
        const textParts = parts.slice(9);
        const content = textParts.join(','); // Handles commas in text

        if (!content) {
          console.log('Skipping entry with empty content');
          continue;
        }

       const formatTimestamp = (timestamp: string) => {
          const trimmed = timestamp.trim();
          let formatted = trimmed;
          
          // Add leading zero if first digit is single (1: -> 01:, 2: -> 02:, etc.)
          if (/^\d:/.test(trimmed)) {
            formatted = '0' + trimmed;
          }
          
          // Optional: Replace dot with comma if needed to match SRT style
          // formatted = formatted.replace('.', ',');
          return formatted;
        };

        const entry: Partial<SubtitleCue> = {
          transcription: transcription,
          id: idCounter++,
          from: timestampToSeconds(formatTimestamp(startTime)),
          to: timestampToSeconds(formatTimestamp(endTime)),
          content: removeTags(content.trim()),
        };

        console.log('Parsed entry:', entry);
        result.push(entry);
      } else {
        console.warn(`Malformed Dialogue line at index ${i}:`, line);
      }
    } else {
      console.log('Non-dialogue line, skipping');
    }
  }

  console.log('Finished parsing. Total entries:', result);
  return result as SubtitleCue[];
}