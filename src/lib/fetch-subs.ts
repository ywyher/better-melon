import { SubtitleCue, SubtitleDisplayMode, SubtitleFormat } from "@/types/subtitle";
import * as kuromoji from "kuromoji";
// @ts-expect-error - Kuroshiro lacks proper TypeScript typings
import Kuroshiro from "kuroshiro";
// @ts-expect-error - KuromojiAnalyzer lacks proper TypeScript typings
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

interface KuroshiroInstance {
  init: (analyzer: unknown) => Promise<void>;
  convert: (text: string, options?: { to?: string; mode?: string }) => Promise<string>;
}

// Global instances to avoid re-initialization
let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let kuroshiro: KuroshiroInstance | null = null;

export async function fetchSubtitles(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

export async function parseSubtitleToJson({ url, format, mode = 'japanese' }: { url: string, format: SubtitleFormat, mode?: SubtitleDisplayMode }) {
  const content = await fetchSubtitles(url);
  
  switch (format) {
    case 'srt':
      const srtSubs = parseSrt(content);
      
      // Initialize required tools once
      await initializeProcessors(mode);
      
      if (mode === 'japanese') {
        // Only tokenize for Japanese mode
        return tokenizeSubtitles(srtSubs);
      } else {
        // For other modes, convert and tokenize in one pass
        const tokanizedSrtSubs = tokenizeSubtitles(srtSubs)
        return processSubtitlesForNonJapaneseMode(tokanizedSrtSubs, mode);
      }
    case "vtt":
      const vttSubs = parseVtt(content);
      return vttSubs
    default:
      throw new Error(`Unsupported subtitle format: ${format}`);
  }
}

async function initializeProcessors(mode: SubtitleDisplayMode) {
  // Initialize tokenizer if not already done
  if (!tokenizer) {
    tokenizer = await createTokenizer();
  }
  
  // Initialize kuroshiro if not already done (for non-japanese modes only)
  if (!kuroshiro && mode != 'japanese') {
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

function tokenizeSubtitles(subs: SubtitleCue[]) {
  if (!tokenizer) {
    throw new Error("Tokenizer not initialized");
  }
  
  return subs.map(sub => ({
    ...sub,
    tokens: tokenizer!.tokenize(sub.content || '')
      .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
  }));
}

async function processSubtitlesForNonJapaneseMode(subs: SubtitleCue[], mode: SubtitleDisplayMode) {
  if (!kuroshiro || !tokenizer) {
    throw new Error("Processors not initialized");
  }
  
  return Promise.all(
    subs.map(async sub => {
    const convertedContent = await kuroshiro!.convert(sub.content, { to: mode });
      
    // Converting the already tokanzied text so we get consistent tokens across modes
    const convertedTokens = sub.tokens
      ? await Promise.all(
          sub.tokens
            .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
            .map(async token => {
              const convertedToken = await kuroshiro!.convert(token.surface_form, { to: mode });
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

function parseSrt(content: string) {
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

function parseVtt(content: string) {
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
    
    // VTT timestamp format: 00:00:00.000 --> 00:00:00.000
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    
    if (timestampMatch) {
      currentEntry.from = timestampMatch[1];
      currentEntry.to = timestampMatch[2];
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

function removeHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}