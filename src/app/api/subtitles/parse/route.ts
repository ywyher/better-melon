import { NextRequest, NextResponse } from 'next/server';
import type { SubtitleCue, SubtitleTranscription, SubtitleFormat, SubtitleToken } from "@/types/subtitle";
import { convertSubtitlesForNonJapaneseTranscription, parseAss, parseSrt, parseVtt, processEnglishSubtitles } from '@/lib/subtitle/parse';
import { redis } from '@/lib/redis';
import { subtitleCacheGroup } from '@/lib/constants/subtitle';
import { getTokenizer as getTokenizerKuromojin, type Tokenizer } from "kuromojin";
import path from "path";

type CacheKey = string;
interface SubtitleCache {
  content: string;
  parsedSubtitles: SubtitleCue[];
  tokenizedSubtitles: {
    transcription: SubtitleTranscription
    cues: SubtitleCue[]
  }[];
  lastAccessed: number;
}

export interface SubtitleRequestBody {
  source: string;
  format: SubtitleFormat;
  transcription: SubtitleTranscription;
  isFile?: boolean;
  fileContent?: string;
  lastModified?: number;
}

// Keep in-memory tracking for ongoing operations to prevent duplicate work
const fetchingInProgress = new Map<CacheKey, Promise<string>>();
const parsingInProgress = new Map<string, Promise<SubtitleCue[]>>();
const tokenizationInProgress = new Map<string, Promise<SubtitleCue[]>>();

// Tokenizer caching
const TOKENIZER_CACHE_KEY = 'tokenizer';
const TOKENIZER_CACHE_TTL = 86400; // 24 hours
let tokenizer: Tokenizer | null = null;
let tokenizerInitPromise: Promise<Tokenizer> | null = null;

async function getCacheFromRedis(key: string): Promise<SubtitleCache | null> {
  try {
    const cached = await redis.get(`${subtitleCacheGroup}${key}`);
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
    await redis.setex(`${subtitleCacheGroup}${key}`, ttl, JSON.stringify(data));
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

async function deleteCacheFromRedis(key: string): Promise<void> {
  try {
    await redis.del(`${subtitleCacheGroup}${key}`);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

async function getTokenizerFromRedis(): Promise<boolean> {
  try {
    const cached = await redis.get(TOKENIZER_CACHE_KEY);
    if (cached) {
      console.info('Tokenizer found in Redis cache');
      // For tokenizer, we just check if it exists - the actual initialization
      // still needs to happen in memory, but we can skip re-downloading dictionary
      return true;
    }
    return false;
  } catch (error) {
    console.error('Redis tokenizer get error:', error);
    return false;
  }
}

async function setTokenizerToRedis(): Promise<void> {
  try {
    // We store a simple flag that tokenizer dictionary is cached
    await redis.setex(TOKENIZER_CACHE_KEY, TOKENIZER_CACHE_TTL, JSON.stringify({
      cached: true,
      timestamp: Date.now()
    }));
    console.info('Tokenizer cache flag set in Redis');
  } catch (error) {
    console.error('Redis tokenizer set error:', error);
  }
}

export async function initializeTokenizer(name?: string): Promise<Tokenizer> {
  if (tokenizer) {
    console.info(`~${name} Tokenizer already exists in memory`);
    return tokenizer;
  }

  if (tokenizerInitPromise) {
    console.info(`~${name} Waiting for existing tokenizer initialization`);
    return await tokenizerInitPromise;
  }

  const tokenizerStart = performance.now();
  
  tokenizerInitPromise = (async () => {
    // Check if tokenizer dictionary is cached in Redis
    const isCached = await getTokenizerFromRedis();
    
    if (isCached) {
      console.info(`~${name} Using cached tokenizer dictionary`);
    } else {
      console.info(`~${name} Initializing fresh tokenizer (will cache)`);
    }

    const filePath = path.join(process.cwd(), 'public', 'dict');
    const newTokenizer = await getTokenizerKuromojin({ dicPath: filePath });
    
    // Cache the tokenizer flag in Redis after successful initialization
    if (!isCached) {
      await setTokenizerToRedis();
    }
    
    tokenizer = newTokenizer;
    const tokenizerEnd = performance.now();
    console.info(`~${name} Tokenizer initialization took --> ${tokenizerEnd - tokenizerStart}ms`);
    
    return newTokenizer;
  })().catch(error => {
    tokenizerInitPromise = null;
    throw error;
  });

  return await tokenizerInitPromise;
}

export function isTokenizerInitialized() {
  return tokenizer ? true : false
}

async function tokenizeJapaneseSubtitles(subs: SubtitleCue[], transcription: SubtitleTranscription): Promise<SubtitleCue[]> {
  const currentTokenizer = await initializeTokenizer(transcription);
  
  if (!currentTokenizer) {
    throw new Error("Tokenizer initialization failed");
  }
  
  const results = [];

  for (const sub of subs) {
    const rawTokens = currentTokenizer.tokenize(sub.content || '');
    
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

export function getCacheKey({
  source, 
  isFile,
  lastModified
}: {
  source: string, 
  isFile: boolean,
  lastModified?: number
}): string {
  if (isFile && lastModified) {
    return `file-${source}-${lastModified}`;
  }
  return source;
}

export async function fetchSubtitleContent({
  source,
  isFile,
  lastModified,
  fileContent
}: {
  source: string,
  isFile: boolean,
  lastModified?: number,
  fileContent?: string
}) {
  const cacheKey = getCacheKey({
    source,
    isFile,
    lastModified
  });
  const sourceType = isFile ? 'file' : 'url';
  
  // Check Redis cache first
  const cachedData = await getCacheFromRedis(cacheKey);
  
  if (cachedData && cachedData.content) {
    console.info(`Using cached subtitle content for ${sourceType}: ${cacheKey}`);
    // Update last accessed time
    await updateCacheInRedis(cacheKey, { lastAccessed: Date.now() });
    return cachedData.content;
  }

  if (fetchingInProgress.has(cacheKey)) {
    console.info(`Waiting for in-progress fetch of ${sourceType}: ${cacheKey}`);
    return await fetchingInProgress.get(cacheKey)!;
  }
  
  console.info(`Fetching subtitle content for ${sourceType}: ${cacheKey}`);
  
  let fetchPromise: Promise<string>;
  
  if (isFile && fileContent) {
    fetchPromise = Promise.resolve(fileContent);
  } else if (!isFile) {
    fetchPromise = fetch(source)
      .then(response => response.text());
  } else {
    throw new Error('Invalid source: file content required for file type');
  }
  
  fetchPromise = fetchPromise
    .then(async text => {
      const existingCache = await getCacheFromRedis(cacheKey);
      console.log(`settings`, cacheKey)
      if (!existingCache) {
        await setCacheToRedis(cacheKey, {
          content: text,
          parsedSubtitles: [],
          tokenizedSubtitles: [],
          lastAccessed: Date.now()
        });
      } else {
        await updateCacheInRedis(cacheKey, { 
          content: text, 
          lastAccessed: Date.now() 
        });
      }
      
      fetchingInProgress.delete(cacheKey);
      return text;
    })
    .catch(error => {
      fetchingInProgress.delete(cacheKey);
      throw error;
    });
  
  fetchingInProgress.set(cacheKey, fetchPromise);
  return await fetchPromise;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      source, 
      format, 
      transcription = 'japanese',
      isFile = false,
      fileContent,
      lastModified 
    }: SubtitleRequestBody = body;

    if (!source || !format) {
      return NextResponse.json(
        { error: 'Source and format are required' },
        { status: 400 }
      );
    }
    
    const cacheKey = getCacheKey({
      source,
      isFile,
      lastModified
    });
    
    const cachedData = await getCacheFromRedis(cacheKey);
    console.log(`###############################CACHE`)
    console.log(cachedData ? true : false)
    console.log(`###############################CACHE`)

    const fetchStart = performance.now();
    const content = await fetchSubtitleContent({
      source,
      isFile,
      fileContent,
      lastModified
    });
    const fetchEnd = performance.now();
    console.info(`~${transcription}-fetchSubtitles took --> ${fetchEnd - fetchStart}ms`);

    let subtitles: SubtitleCue[] = [];

    if (
      cachedData 
      && cachedData.parsedSubtitles.length > 0
    ) {
      console.info(`~${transcription} Using cached parsed subtitles`);
      subtitles = cachedData.parsedSubtitles;
    } else {
      // Check if parsing is already in progress for this cache key
      if (parsingInProgress.has(cacheKey)) {
        console.info(`~${transcription} Waiting for in-progress parsing of ${cacheKey}`);
        subtitles = await parsingInProgress.get(cacheKey)!;
      } else {
        console.info(`~${transcription} Parsing subtitles (not in cache)`);
        
        // Create parsing promise
        const parsingPromise: Promise<SubtitleCue[]> = (async () => {
          let parsedSubs: SubtitleCue[] = [];
          
          switch (format) {
            case 'srt':
              const parseSrtStart = performance.now();
              parsedSubs = parseSrt(content, transcription);
              const parseSrtEnd = performance.now();
              console.info(`~${transcription}-parse-srt took --> ${parseSrtEnd - parseSrtStart}ms`);
              break;
            case 'vtt':
              const parseVttStart = performance.now();
              parsedSubs = parseVtt(content, transcription);
              const parseVttEnd = performance.now();
              console.info(`~${transcription}-parse-vtt took --> ${parseVttEnd - parseVttStart}ms`);
              break;
            case 'ass':
              const parseAssStart = performance.now();
              parsedSubs = parseAss(content, transcription);
              const parseAssEnd = performance.now();
              console.info(`~${transcription}-parse-ass took --> ${parseAssEnd - parseAssStart}ms`);
              break;
            default:
              throw new Error(`Unsupported subtitle format: ${format}`);
          }

          if (!parsedSubs.length) {
            parsingInProgress.delete(cacheKey);
            return [];
          }
          
          // Save parsed subtitles to Redis cache
          console.info(`~${transcription} Saving parsed subtitles to cache`);
          await updateCacheInRedis(cacheKey, { parsedSubtitles: parsedSubs });
          
          parsingInProgress.delete(cacheKey);
          return parsedSubs;
        })().catch(error => {
          parsingInProgress.delete(cacheKey);
          throw error;
        });

        parsingInProgress.set(cacheKey, parsingPromise);
        subtitles = await parsingPromise;
      }
    }

    // Handle empty subtitles case
    if (!subtitles.length) {
      return NextResponse.json({
        transcription,
        format,
        cues: []
      });
    }

    if (transcription === 'english') {
      const processStart = performance.now();
      const processedSubs = processEnglishSubtitles(subtitles);
      const processEnd = performance.now();
      console.info(`~${transcription}-processEnglishSubtitles took --> ${processEnd - processStart}ms`);
      
      return NextResponse.json({
        transcription,
        format,
        cues: processedSubs
      });
    }
    
    // Check Redis cache for tokenized subtitles
    const isTokenizerCached = await getTokenizerFromRedis()
    const updatedCachedData = await getCacheFromRedis(cacheKey);
    if (
      updatedCachedData 
      && (updatedCachedData.tokenizedSubtitles.find(t => t.transcription == transcription)?.cues || []).length > 0
      && isTokenizerCached
    ) {
      console.info(`~${transcription} Using cached tokenized subtitles`);
      const tokenizedSubs = updatedCachedData.tokenizedSubtitles.find(t => t.transcription == transcription)?.cues || [];
      
      // If not pure Japanese, convert to the target transcription
      if (transcription !== 'japanese') {
        const currentTokenizer = await initializeTokenizer(transcription);
        const conversionStart = performance.now();
        const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription, currentTokenizer);
        const conversionEnd = performance.now();
        console.info(`~${transcription}-convertNonJapaneseSubtitles took --> ${conversionEnd - conversionStart}ms`);
        
        return NextResponse.json({
          transcription,
          format,
          cues: convertedSubs
        });
      }
      
      return NextResponse.json({
        transcription,
        format,
        cues: tokenizedSubs
      });
    }
    
    // Check if this resource is already being tokenized by another call
    if (tokenizationInProgress.has(cacheKey)) {
      console.info(`Waiting for in-progress tokenization of ${transcription} for ${cacheKey}`);
      const tokenizedSubs = await tokenizationInProgress.get(cacheKey)!;
      
      // If not pure Japanese, convert to the target transcription
      if (transcription !== 'japanese') {
        const currentTokenizer = await initializeTokenizer(transcription);
        const conversionStart = performance.now();
        const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription, currentTokenizer);
        const conversionEnd = performance.now();
        console.info(`~${transcription}-convertNonJapaneseSubtitles took --> ${conversionEnd - conversionStart}ms`);
        
        return NextResponse.json({
          transcription,
          format,
          cues: convertedSubs
        });
      }
      
      return NextResponse.json({
        transcription,
        format,
        cues: tokenizedSubs
      });
    }

    // Start new tokenization process
    console.info(`Starting tokenization for ${cacheKey}`);
    const tokenizationStart = performance.now();

    const tokenizationPromise: Promise<SubtitleCue[]> = tokenizeJapaneseSubtitles(subtitles, transcription)
      .then(async subs => {
        const tokenizationEnd = performance.now();
        console.info(`tokenization took --> ${tokenizationEnd - tokenizationStart}ms`);
      
        // Save to Redis cache
        await updateCacheInRedis(cacheKey, { 
          tokenizedSubtitles: [
            ...updatedCachedData?.tokenizedSubtitles || [],
            {
              transcription,
              cues: subs
            }
          ],
          lastAccessed: Date.now()
        });
        
        console.log(`~${transcription} subtitles tokenized and cached`)
        tokenizationInProgress.delete(cacheKey);
        return subs;
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
      console.info(`~${transcription}-convertNonJapaneseSubtitles took --> ${conversionEnd - conversionStart}ms`);
      
      return NextResponse.json({
        transcription,
        format,
        cues: convertedSubs
      });
    }

    return NextResponse.json({
      transcription,
      format,
      cues: tokenizedSubs
    });

  } catch (error) {
    console.error('Error processing subtitles:', error);
    return NextResponse.json(
      { error: 'Failed to process subtitles' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear Redis cache
export async function DELETE(request: NextRequest) {
  try {
    // Clear all subtitle caches AND tokenizer cache
    try {
      const keys = await redis.keys(`${subtitleCacheGroup}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      // Clear tokenizer cache
      await redis.del(TOKENIZER_CACHE_KEY);
      
      // Clear in-memory caches
      fetchingInProgress.clear();
      parsingInProgress.clear();
      tokenizationInProgress.clear();
      
      // Reset tokenizer
      tokenizer = null;
      tokenizerInitPromise = null;
      
      return NextResponse.json({ message: 'All cache cleared including tokenizer' });
    } catch (error) {
      console.error('Error clearing all Redis cache:', error);
      return NextResponse.json(
        { error: 'Failed to clear all cache' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}