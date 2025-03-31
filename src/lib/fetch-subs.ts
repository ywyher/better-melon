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

export async function parseSubtitleToJson({ url, format, mode }: { url: string, format: SubtitleFormat, mode: SubtitleDisplayMode }) {
  const content = await fetchSubtitles(url);
  
  switch (format) {
    case 'srt':
      const subs = parseSrt(content);
      
      // Initialize required tools once
      await initializeProcessors(mode);
      
      if (mode === 'japanese') {
        // Only tokenize for Japanese mode
        return tokenizeSubtitles(subs);
      } else {
        // For other modes, convert and tokenize in one pass
        return processSubtitlesForNonJapaneseMode(subs, mode);
      }
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
      // Convert to the target script
      const convertedContent = await kuroshiro!.convert(sub.content, { to: mode });
      
      // Return with both conversion and tokenization
      return {
        ...sub,
        original_content: sub.content,
        content: convertedContent,
        tokens: tokenizer!.tokenize(convertedContent)
          .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
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