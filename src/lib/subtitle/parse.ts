'use server'

import type { SubtitleCue, SubtitleTranscription, ParseSubtitleBody, SubtitleCache, SubtitleFormat } from "@/types/subtitle";
import { getSubtitleCacheKey } from '@/lib/utils/subtitle';
import { parseSrt } from "@/lib/subtitle/parsers/srt";
import { parseVtt } from "@/lib/subtitle/parsers/vtt";
import { parseAss } from "@/lib/subtitle/parsers/ass";
import { tokenizeJapaneseSubtitles } from "@/lib/subtitle/tokenizers/japanese";
import { tokenizeEnglishSubtitles } from "@/lib/subtitle/tokenizers/english";
import { convertSubtitlesForNonJapaneseTranscription } from "@/lib/subtitle/converter";
import { CacheKey } from "@/types";
import { getCache } from "@/lib/db/queries";
import { setCache, updateCache } from "@/lib/db/mutations";
import { initializeTokenizer } from "@/lib/subtitle/tokenizer";
import { tokenizerStats } from "@/lib/subtitle/globals";
import { readFileContent } from "@/lib/utils/utils";

// Keep in-memory tracking for ongoing operations to prevent duplicate work
const fetchingInProgress = new Map<CacheKey, Promise<string>>();
const parsingInProgress = new Map<string, Promise<SubtitleCue[]>>();

export async function fetchSubtitleContent({
  source,
  isFile,
  cacheKey,
  lastModified,
  fileContent,
  transcription
}: {
  source: string,
  isFile: boolean,
  cacheKey: CacheKey
  lastModified?: number,
  fileContent?: string,
  transcription: SubtitleTranscription
}) {
  const sourceType = isFile ? 'file' : 'url';
  const sourceId = isFile ? source : source.substring(0, 100);
  
  console.log(`[SubtitleFetch(${transcription})] Starting fetch for ${sourceType}`, {
    cacheKey,
    sourceId,
    lastModified,
    hasFileContent: !!fileContent
  });
  
  // Check Redis cache first
  const cachedData = await getCache(`${cacheKey}`, true);
  
  if (cachedData?.content) {
    console.log(`[SubtitleFetch(${transcription})] Cache hit for ${sourceType}`, {
      cacheKey,
      sourceId,
      contentLength: cachedData.content.length
    });
    
    // dont await (runs in the background)
    updateCache(cacheKey, { lastAccessed: Date.now() }).catch(console.error);
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
      
      const existingCache = await getCache(`${cacheKey}`, true);

      const cacheData = {
        content: text,
        parsedSubtitles: existingCache?.parsedSubtitles || [],
        tokenizedSubtitles: existingCache?.tokenizedSubtitles || [],
        convertedSubtitles: existingCache?.convertedSubtitles || {},
        lastAccessed: Date.now()
      };
      
      if (!existingCache) {
        console.log(`[SubtitleFetch(${transcription})] Creating new cache entry`, { cacheKey });
        // AWAIT: New cache entry is critical - other operations depend on it
        await setCache(cacheKey, cacheData);
      } else {
        console.log(`[SubtitleFetch(${transcription})] Updating existing cache entry`, { cacheKey });
        // AWAIT: Content update is critical - parsing depends on having the content
        await updateCache(cacheKey, { content: text, lastAccessed: Date.now() });
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

async function getCachedSubtitles({
  source,
  isFile,
  lastModified
}: {
  source: string;
  isFile: boolean;
  lastModified?: number;
}) {
  const cacheKey = getSubtitleCacheKey({
    source,
    isFile,
    lastModified
  });

  const cachedData: SubtitleCache = await getCache(`${cacheKey}`, true);

  return {
    cachedData: {
      content: cachedData?.content || "",
      parsedSubtitles: cachedData?.parsedSubtitles || [],
      tokenizedSubtitles: cachedData?.tokenizedSubtitles || [],
      convertedSubtitles: {
        hiragana: cachedData?.convertedSubtitles?.hiragana || [],
        katakana: cachedData?.convertedSubtitles?.katakana || [],
        romaji: cachedData?.convertedSubtitles?.romaji || [],
        furigana: cachedData?.convertedSubtitles?.furigana || [],
      },
      lastAccessed: cachedData?.lastAccessed || 0
    },
    cacheKey
  }
}

async function parseSubtitles({
  cachedData,
  cacheKey,
  transcription,
  format,
  content
}: {
  cachedData: SubtitleCache
  transcription: SubtitleTranscription
  cacheKey: CacheKey
  format: SubtitleFormat
  content: string
}) {
  if (cachedData?.parsedSubtitles?.length > 0) {
    console.info(`[Parsing(${transcription})] Using cached parsed subtitles (${cachedData.parsedSubtitles.length} cues)`);
    return cachedData.parsedSubtitles;
  }

  if (parsingInProgress.has(cacheKey)) {
    console.info(`[Parsing(${transcription})] Waiting for in-progress parsing of cache key: ${cacheKey}`);
    return await parsingInProgress.get(cacheKey)!;
  }

  console.info(`[Parsing(${transcription})] Starting subtitle parsing - format: ${format}, cache key: ${cacheKey}`);  
  const fetchStart = performance.now();

  const parsingPromise: Promise<SubtitleCue[]> = (async () => {
    let parsedSubs: SubtitleCue[] = [];
    
    switch (format) {
      case 'srt':
        parsedSubs = parseSrt(content, transcription);
        break;
      case 'vtt':
        parsedSubs = parseVtt(content, transcription);
        break;
      case 'ass':
        parsedSubs = parseAss(content, transcription);
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
    
    console.info(`[Parsing(${transcription})] Saving ${parsedSubs.length} parsed subtitles to Redis cache`);
    // AWAIT: Parsed subtitles are needed for tokenization step
    await updateCache(cacheKey, { 
      parsedSubtitles: parsedSubs, 
      lastAccessed: Date.now() 
    });
    console.info(`[Parsing(${transcription})] Successfully cached parsed subtitles`);

    const fetchEnd = performance.now();
    console.info(`[SubtitleFetch(${transcription})] took --> ${fetchEnd - fetchStart}ms`);
    parsingInProgress.delete(cacheKey);
    return parsedSubs;
  })().catch(error => {
    console.error(`[${transcription}] Error during subtitle parsing:`, error);
    parsingInProgress.delete(cacheKey);
    throw error;
  });

  parsingInProgress.set(cacheKey, parsingPromise);
  return await parsingPromise;
}

async function processTokenizedSubtitles({
  tokenizedSubs, 
  transcription, 
  format, 
  cacheKey, 
  cachedData
}: {
  tokenizedSubs: SubtitleCue[], 
  transcription: SubtitleTranscription, 
  format: SubtitleFormat, 
  cacheKey: CacheKey,
  cachedData: SubtitleCache
}) {
  if (transcription !== 'japanese') {
    const currentTokenizer = await initializeTokenizer(transcription);
    const convertedSubs = await convertSubtitlesForNonJapaneseTranscription(tokenizedSubs, transcription, currentTokenizer);
    
    updateCache(cacheKey, { 
      convertedSubtitles: {
        ...cachedData?.convertedSubtitles,
        [transcription]: convertedSubs
      },
      lastAccessed: Date.now()
    }).catch(console.error);

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

async function tokenizeAndConvertSubtitles({
  cacheKey,
  cachedData,
  transcription,
  format,
  subtitles
}: {
  cacheKey: CacheKey;
  cachedData: SubtitleCache
  transcription: SubtitleTranscription
  format: SubtitleFormat
  subtitles: SubtitleCue[]
}) {
  if (transcription === 'japanese' || transcription === 'english') {
    if ((cachedData?.tokenizedSubtitles || []).length > 0) {
      console.info(`[Tokenizing(${transcription})] Using cached tokenized subtitles`);
      return {
        transcription,
        format,
        cues: cachedData.tokenizedSubtitles
      };
    }
  } else {
    // For non-Japanese/English transcriptions, check converted subtitles
    if ((cachedData?.convertedSubtitles?.[transcription] || []).length > 0) {
      console.info(`[Convert(${transcription})] Using cached converted subtitles`);
      return {
        transcription,
        format,
        cues: cachedData.convertedSubtitles?.[transcription]
      };
    }
  }

  if (transcription === 'english') {
    const cues = tokenizeEnglishSubtitles(subtitles);
    
    console.info(`[Tokenizing(${transcription})] Saving ${cues.length} tokenized subtitles to Redis cache`);
    // AWAIT cache update because this data might be needed by other requests
    await updateCache(cacheKey, { 
      tokenizedSubtitles: cues, 
      lastAccessed: Date.now() 
    });
    
    return {
      transcription,
      format,
      cues: cues
    };
  }

  let tokenizationInProgress = tokenizerStats.tokenizationInProgress
  // Check if this resource is already being tokenized by another call
  if (tokenizationInProgress.has(cacheKey)) {
    console.info(`[Tokenizing(${transcription})] Waiting for in-progress tokenization of ${transcription} for ${cacheKey}`);
    const tokenizedSubs = await tokenizationInProgress.get(cacheKey)!;
    
    return await processTokenizedSubtitles({
      tokenizedSubs,
      transcription,
      format,
      cacheKey,
      cachedData
    });
  }

  // Start new tokenization process
  console.info(`[Tokenizing(${transcription})] Starting tokenization for ${cacheKey}`);
  const tokenizationStart = performance.now();
  const tokenizationPromise: Promise<SubtitleCue[]> = tokenizeJapaneseSubtitles(subtitles, transcription)
    .then(async cues => {
      const tokenizationEnd = performance.now();
      console.info(`[Tokenizing(${transcription})] took --> ${tokenizationEnd - tokenizationStart}ms`);
    
      await updateCache(cacheKey, { 
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
  return await processTokenizedSubtitles({
    tokenizedSubs,
    transcription,
    format,
    cacheKey,
    cachedData
  });
}

async function getParsingData({
  source,
}: {
  source: string | File,
}) {
  let body: ParseSubtitleBody = {
    source: typeof source === 'string' ? source : source.name,
    isFile: typeof source !== 'string' ? true : false
  };
  
  if (typeof source !== 'string') {
    body.fileContent = await readFileContent(source);
    body.lastModified = source.lastModified;
  }

  return body
}

export async function parseSubtitlesFile({
  source: rawSource,
  format,
  transcription = 'japanese',
}: {
  source: string | File,
  format: SubtitleFormat,
  transcription: SubtitleTranscription
}): Promise<any> {
  try {
    const { source, fileContent, isFile, lastModified } = await getParsingData({ source: rawSource })
    
    const { cacheKey, cachedData } = await getCachedSubtitles({
      isFile,
      source,
      lastModified
    })

    const content = await fetchSubtitleContent({
      source,
      isFile,
      cacheKey,
      fileContent,
      lastModified,
      transcription
    });

    const subtitles = await parseSubtitles({
      cachedData,
      cacheKey,
      content,
      format,
      transcription
    })
    
    // Handle empty subtitles case
    if (!subtitles.length) throw new Error("No cues found")

    const result = await tokenizeAndConvertSubtitles({
      cachedData,
      cacheKey,
      format,
      subtitles,
      transcription
    })

    return result.cues;
  } catch (error) {
    console.error('Error processing subtitles:', error);
    throw error;
  }
}