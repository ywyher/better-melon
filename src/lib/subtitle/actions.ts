
'use server'

import type { SubtitleCue, SubtitleTranscription, ParseSubtitleBody, SubtitleCache } from "@/types/subtitle";
import { getSubtitleCacheKey } from '@/lib/subtitle/utils';
import { redis } from '@/lib/redis';
import { getTokenizer as getTokenizerKuromojin, KuromojiToken, type Tokenizer } from "kuromojin";
import path from "path";
import { cacheKeys } from '@/lib/constants/cache';
import { parseSrt } from "@/lib/subtitle/parsers/srt";
import { parseVtt } from "@/lib/subtitle/parsers/vtt";
import { parseAss } from "@/lib/subtitle/parsers/ass";
import { tokenizeJapaneseSubtitles } from "@/lib/subtitle/tokenizers/japanese";
import { tokenizeEnglishSubtitles } from "@/lib/subtitle/tokenizers/english";
import { convertSubtitlesForNonJapaneseTranscription } from "@/lib/subtitle/converter";
import { CacheKey } from "@/types";

// Keep in-memory tracking for ongoing operations to prevent duplicate work
const fetchingInProgress = new Map<CacheKey, Promise<string>>();
const parsingInProgress = new Map<string, Promise<SubtitleCue[]>>();
const tokenizationInProgress = new Map<string, Promise<SubtitleCue[]>>();

// Tokenizer caching
let tokenizer: Tokenizer | null = null;
let tokenizerInitPromise: Promise<Tokenizer> | null = null;

export async function tokenizeText(text: string): Promise<KuromojiToken[] | null> {
  try {
    const tokenizer = await initializeTokenizer('tokenizeText');
    
    if (!tokenizer) {
      throw new Error('Failed to initialize tokenizer');
    }
    
    const rawTokens = tokenizer.tokenize(text);
    
    const tokens = rawTokens
      .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
      .map(token => ({
        surface_form: token.surface_form,
        basic_form: token.basic_form,
        reading: token.reading,
        pronunciation: token.pronunciation,
        pos: token.pos,
        pos_detail_1: token.pos_detail_1,
        pos_detail_2: token.pos_detail_2,
        pos_detail_3: token.pos_detail_3,
        conjugated_type: token.conjugated_type,
        conjugated_form: token.conjugated_form,
        word_position: token.word_position,
        word_id: token.word_id,
        word_type: token.word_type
      }));
    
    return tokens
  } catch (error) {
    console.error('Error tokenizing text:', error);
    return null
  }
}

async function getCacheFromRedis(key: string): Promise<SubtitleCache | null> {
  try {
    const cached = await redis.get(`${cacheKeys.subtitle(key)}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

async function setCacheToRedis(key: string, data: SubtitleCache, ttl: number = 3600): Promise<void> {
  try {
    await redis.setex(`${cacheKeys.subtitle(key)}`, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

async function updateCacheInRedis(key: string, updates: Partial<SubtitleCache>): Promise<void> {
  try {
    const existing = await getCacheFromRedis(key);
    if (existing) {
      const updated = { ...existing, ...updates, lastAccessed: Date.now() };
      await setCacheToRedis(key, updated);
    }
  } catch (error) {
    console.error('Redis update error:', error);
  }
}

export async function initializeTokenizer(name?: string): Promise<Tokenizer> {
  if (tokenizer) {
    console.info(`[Tokenizer] ${name} already exists in memory`);
    return tokenizer;
  }

  if (tokenizerInitPromise) {
    console.info(`[Tokenizer] ${name} Waiting for existing tokenizer initialization`);
    return await tokenizerInitPromise;
  }

  const tokenizerStart = performance.now();
  
  tokenizerInitPromise = (async () => {
    const filePath = path.join(process.cwd(), 'public', 'dict');
    const newTokenizer = await getTokenizerKuromojin({ dicPath: filePath });
    
    tokenizer = newTokenizer;
    const tokenizerEnd = performance.now();
    console.info(`[Tokenizer] ${name} Tokenizer initialization took --> ${tokenizerEnd - tokenizerStart}ms`);
    
    return newTokenizer
  })().catch(error => {
    tokenizerInitPromise = null;
    throw error;
  });

  return await tokenizerInitPromise;
}

export async function initializeTokenizerThroughClient() {
  try {
    const start = performance.now();
    const tokenizer = await initializeTokenizer('initializeTokenizer-through-client');
    const end = performance.now();
    
    if(tokenizer) {
      return {
        isInitialized: true,
        initializationTime: Number((end - start).toFixed(2)),
        message: 'Tokenizer initialized successfully'
      };
    } else {
      throw new Error("Failed to initalize tokenizer")
    }
  } catch (error) {
    console.error('Error initializing tokenizer:', error);
    return {
      isInitialized: false,
      initializationTime: 0,
      error: 'Failed to initialize tokenizer'
    };
  }
}

export async function isTokenizerInitialized() {
  return tokenizer ? true : false
}

export async function fetchSubtitleContent({
  source,
  isFile,
  lastModified,
  fileContent,
  transcription
}: {
  source: string,
  isFile: boolean,
  lastModified?: number,
  fileContent?: string,
  transcription: SubtitleTranscription
}) {
  const cacheKey = getSubtitleCacheKey({
    source,
    isFile,
    lastModified
  });
  const sourceType = isFile ? 'file' : 'url';
  const sourceId = isFile ? source : source.substring(0, 100);
  
  console.log(`[SubtitleFetch(${transcription})] Starting fetch for ${sourceType}`, {
    cacheKey,
    sourceId,
    lastModified,
    hasFileContent: !!fileContent
  });
  
  // Check Redis cache first
  const cachedData = await getCacheFromRedis(cacheKey);
  
  if (cachedData && cachedData.content) {
    console.log(`[SubtitleFetch(${transcription})] Cache hit for ${sourceType}`, {
      cacheKey,
      sourceId,
      contentLength: cachedData.content.length
    });
    
    // Update last accessed time
    await updateCacheInRedis(cacheKey, { lastAccessed: Date.now() });
    console.log(`[SubtitleFetch(${transcription})] Updated cache access time for ${sourceType}`, { cacheKey });
    
    return cachedData.content;
  }

  console.log(`[SubtitleFetch(${transcription})] Cache miss for ${sourceType}`, { cacheKey, sourceId });

  if (fetchingInProgress.has(cacheKey)) {
    console.log(`[SubtitleFetch(${transcription})] Waiting for in-progress fetch of ${sourceType}`, { cacheKey });
    return await fetchingInProgress.get(cacheKey)!;
  }
  
  console.log(`[SubtitleFetch(${transcription})] Initiating new fetch for ${sourceType}`, { cacheKey, sourceId });
  
  let fetchPromise: Promise<string>;
  
  if (isFile && fileContent) {
    console.log(`[SubtitleFetch(${transcription})] Using provided file content`, { 
      cacheKey, 
      contentLength: fileContent.length 
    });
    fetchPromise = Promise.resolve(fileContent);
  } else if (!isFile) {
    console.log(`[SubtitleFetch(${transcription})] Fetching from URL`, { cacheKey, url: source });
    fetchPromise = fetch(source)
      .then(response => {
        console.log(`[SubtitleFetch(${transcription})] HTTP response received`, {
          cacheKey,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });
        return response.text();
      });
  } else {
    const error = new Error('Invalid source: file content required for file type');
    console.error(`[SubtitleFetch(${transcription})] Invalid source configuration`, {
      cacheKey,
      sourceId,
      isFile,
      hasFileContent: !!fileContent,
      error: error.message
    });
    throw error;
  }
  
  fetchPromise = fetchPromise
    .then(async text => {
      console.log(`[SubtitleFetch(${transcription})] Content fetched successfully`, {
        cacheKey,
        sourceId,
        contentLength: text.length,
        contentPreview: text.substring(0, 200).replace(/\n/g, '\\n')
      });
      
      const existingCache = await getCacheFromRedis(cacheKey);
      if (!existingCache) {
        console.log(`[SubtitleFetch(${transcription})] Creating new cache entry`, { cacheKey });
        await setCacheToRedis(cacheKey, {
          content: text,
          parsedSubtitles: [],
          lastAccessed: Date.now()
        });
      } else {
        console.log(`[SubtitleFetch(${transcription})] Updating existing cache entry`, { cacheKey });
        await updateCacheInRedis(cacheKey, { 
          content: text, 
          lastAccessed: Date.now() 
        });
      }
      
      fetchingInProgress.delete(cacheKey);
      console.log(`[SubtitleFetch(${transcription})] Fetch completed and cached`, { cacheKey, sourceId });
      return text;
    })
    .catch(error => {
      console.error(`[SubtitleFetch(${transcription})] Fetch failed for ${sourceType}`, {
        cacheKey,
        sourceId,
        error: error.message,
        stack: error.stack
      });
      fetchingInProgress.delete(cacheKey);
      throw error;
    });
  
  fetchingInProgress.set(cacheKey, fetchPromise);
  console.log(`[SubtitleFetch(${transcription})] Added to in-progress tracking`, { cacheKey });
  
  return await fetchPromise;
}

export async function parseSubtitleCues({
  source,
  format,
  transcription,
  isFile = false,
  fileContent,
  lastModified,
}: ParseSubtitleBody): Promise<any> {
  try {
    const fetchStart = performance.now();
    const content = await fetchSubtitleContent({
      source,
      isFile,
      fileContent,
      lastModified,
      transcription
    });
    const fetchEnd = performance.now();
    console.info(`[SubtitleFetch(${transcription})] took --> ${fetchEnd - fetchStart}ms`);

    const cacheKey = getSubtitleCacheKey({
      source,
      isFile,
      lastModified
    });
    
    const cachedData = await getCacheFromRedis(cacheKey);

    let subtitles: SubtitleCue[] = [];

    if (
      cachedData 
      && cachedData.parsedSubtitles.length > 0
    ) {
      console.info(`[Parsing(${transcription})] Using cached parsed subtitles (${cachedData.parsedSubtitles.length} cues)`);
      subtitles = cachedData.parsedSubtitles;
    } else {
      // Check if parsing is already in progress for this cache key
      if (parsingInProgress.has(cacheKey)) {
        console.info(`[Parsing(${transcription})] Waiting for in-progress parsing of cache key: ${cacheKey}`);
        subtitles = await parsingInProgress.get(cacheKey)!;
      } else {
        console.info(`[Parsing(${transcription})] Starting subtitle parsing - format: ${format}, cache key: ${cacheKey}`);
        
        // Create parsing promise
        const parsingPromise: Promise<SubtitleCue[]> = (async () => {
          let parsedSubs: SubtitleCue[] = [];
          
          switch (format) {
            case 'srt':
              const parseSrtStart = performance.now();
              parsedSubs = parseSrt(content, transcription);
              const parseSrtEnd = performance.now();
              console.info(`[Parsing(${transcription})] SRT parsing completed in ${Math.round(parseSrtEnd - parseSrtStart)}ms - ${parsedSubs.length} cues parsed`);
              break;
            case 'vtt':
              const parseVttStart = performance.now();
              parsedSubs = parseVtt(content, transcription);
              const parseVttEnd = performance.now();
              console.info(`[Parsing(${transcription})] VTT parsing completed in ${Math.round(parseVttEnd - parseVttStart)}ms - ${parsedSubs.length} cues parsed`);
              break;
            case 'ass':
              const parseAssStart = performance.now();
              parsedSubs = parseAss(content, transcription);
              const parseAssEnd = performance.now();
              console.info(`[Parsing(${transcription})] ASS parsing completed in ${Math.round(parseAssEnd - parseAssStart)}ms - ${parsedSubs.length} cues parsed`);
              break;
            default:
              console.error(`[Parsing(${transcription})] Unsupported subtitle format: ${format}`);
              throw new Error(`Unsupported subtitle format: ${format}`);
          }

          if (!parsedSubs.length) {
            console.warn(`[Parsing(${transcription})] No subtitle cues found after parsing ${format} format`);
            parsingInProgress.delete(cacheKey);
            return [];
          }
          
          // Save parsed subtitles to Redis cache
          console.info(`[Parsing(${transcription})] Saving ${parsedSubs.length} parsed subtitles to Redis cache`);
          await updateCacheInRedis(cacheKey, { parsedSubtitles: parsedSubs });
          console.info(`[Parsing(${transcription})] Successfully cached parsed subtitles`);
          
          parsingInProgress.delete(cacheKey);
          return parsedSubs;
        })().catch(error => {
          console.error(`[${transcription}] Error during subtitle parsing:`, error);
          parsingInProgress.delete(cacheKey);
          throw error;
        });

        parsingInProgress.set(cacheKey, parsingPromise);
        subtitles = await parsingPromise;
      }
    }
    
    // Handle empty subtitles case
    if (!subtitles.length) throw new Error("No cues found")
    // Check Redis cache for tokenized subtitles
    const updatedCachedData = await getCacheFromRedis(cacheKey);
    if (
      updatedCachedData
      && (updatedCachedData.tokenizedSubtitles || []).length > 0
      && (transcription == 'japanese' || transcription == 'english')
    ) {
      console.info(`[Tokenizing(${transcription})] Using cached tokenizing subtitles`);
      const tokenizedSubs = updatedCachedData.tokenizedSubtitles || [];
      
      return {
        transcription,
        format,
        cues: tokenizedSubs
      };
    }

    // If not pure Japanese, convert to the target transcription
    if (
      updatedCachedData
      && (transcription !== 'japanese' && transcription !== 'english')
      && updatedCachedData.convertedSubtitles?.[transcription]
    ) {
      console.info(`[Convert(${transcription})] Using cached converted subtitles`);
      const convertedSubs = updatedCachedData.convertedSubtitles?.[transcription] || [];
      return {
        transcription,
        format,
        cues: convertedSubs
      };
    }

    if (transcription === 'english') {
      console.info(`[Tokenizing(English)] Started`);
      const tokenizationStart = performance.now();
      const cues = tokenizeEnglishSubtitles(subtitles);
      const tokenizationEnd = performance.now();
      console.info(`[Tokenizing(${transcription})] Took --> ${tokenizationEnd - tokenizationStart}ms`);

      console.info(`[Tokenizing(${transcription})] Saving ${cues.length} tokenized subtitles to Redis cache`);
      await updateCacheInRedis(cacheKey, { tokenizedSubtitles: cues });
      console.info(`[Tokenizing(${transcription})] Successfully cached tokenized subtitles`);
      
      return {
        transcription,
        format,
        cues: cues
      };
    }
    
    // Check if this resource is already being tokenized by another call
    if (tokenizationInProgress.has(cacheKey)) {
      console.info(`[Tokenizing] Waiting for in-progress tokenization of ${transcription} for ${cacheKey}`);
      const tokenizedSubs = await tokenizationInProgress.get(cacheKey)!;
        
      if (transcription !== 'japanese') {
        const currentTokenizer = await initializeTokenizer(transcription);
        const conversionStart = performance.now();
        const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription, currentTokenizer);
        const conversionEnd = performance.now();
        console.info(`[Convert(${transcription})] Took --> ${conversionEnd - conversionStart}ms`);
        
        await updateCacheInRedis(cacheKey, { 
          convertedSubtitles: {
            ...updatedCachedData?.convertedSubtitles,
            [transcription]: convertedSubs
          },
          lastAccessed: Date.now()
        });

        return {
          transcription,
          format,
          cues: convertedSubs
        };
      }
      
      return {
        transcription,
        format,
        cues: tokenizedSubs
      };
    }

    // Start new tokenization process
    console.info(`[Tokenizing] Starting tokenization for ${cacheKey}`);
    const tokenizationStart = performance.now();

    const tokenizationPromise: Promise<SubtitleCue[]> = tokenizeJapaneseSubtitles(subtitles, transcription)
      .then(async cues => {
        const tokenizationEnd = performance.now();
        console.info(`[Tokenizing] took --> ${tokenizationEnd - tokenizationStart}ms`);
      
        // Save to Redis cache
        await updateCacheInRedis(cacheKey, { 
          tokenizedSubtitles: cues,
          lastAccessed: Date.now()
        });
        
        tokenizationInProgress.delete(cacheKey);
        return cues;
      })
      .catch(error => {
        tokenizationInProgress.delete(cacheKey);
        throw error;
      });

    tokenizationInProgress.set(cacheKey, tokenizationPromise);
    
    const tokenizedSubs = await tokenizationPromise;
    
    if (transcription !== 'japanese') {
      const currentTokenizer = await initializeTokenizer(transcription);
      const conversionStart = performance.now();
      const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription, currentTokenizer);
      const conversionEnd = performance.now();
      console.info(`[Convert(${transcription})] Took --> ${conversionEnd - conversionStart}ms`);
      
      await updateCacheInRedis(cacheKey, { 
        convertedSubtitles: {
          ...updatedCachedData?.convertedSubtitles,
          [transcription]: convertedSubs
        },
        lastAccessed: Date.now()
      });

      return {
        transcription,
        format,
        cues: convertedSubs
      };
    }

    return {
      transcription,
      format,
      cues: tokenizedSubs
    };

  } catch (error) {
    console.error('Error processing subtitles:', error);
  }
}