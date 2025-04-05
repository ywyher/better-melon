import { SubtitleCue, SubtitleScript, SubtitleFormat } from "@/types/subtitle";
import * as kuromoji from "kuromoji";
// @ts-expect-error - Kuroshiro lacks proper TypeScript typings
import Kuroshiro from "kuroshiro";
// @ts-expect-error - KuromojiAnalyzer lacks proper TypeScript typings
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

import nlp from 'compromise';

interface KuroshiroInstance {
  init: (analyzer: unknown) => Promise<void>;
  convert: (text: string, options?: { to?: string; script?: string }) => Promise<string>;
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
  script = 'japanese' 
}: { 
  source: string | File, 
  format: SubtitleFormat, 
  script?: SubtitleScript 
}) {
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

  // Now process the subtitles based on script type
  if (script === 'english') {
    return processEnglishSubtitles(subtitles);
  } else {
    // Initialize Japanese processors
    await initializeProcessors(script);
    
    // For Japanese, tokenize first
    const tokenizedSubs = tokenizeJapaneseSubtitles(subtitles);
    
    // If not Japanese, convert to the target script
    if (script !== 'japanese') {
      return processSubtitlesForNonJapaneseScript(tokenizedSubs, script);
    }
    
    return tokenizedSubs;
  }
}

async function initializeProcessors(script: SubtitleScript) {
  // Initialize tokenizer if not already done
  if (!tokenizer && script !== 'english') {
    tokenizer = await createTokenizer();
  }
  
  // Initialize kuroshiro if not already done (for non-japanese scripts only)
  if (!kuroshiro && script !== 'japanese' && script !== 'english') {
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
  }));
}

async function processSubtitlesForNonJapaneseScript(subs: SubtitleCue[], script: SubtitleScript) {
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized for script conversion");
  }
  
  return Promise.all(
    subs.map(async sub => {
      if (!sub.content) {
        return sub;
      }
      
      const convertedContent = await kuroshiro!.convert(sub.content, { to: script });
      
      // Converting the already tokenized text so we get consistent tokens across scripts
      const convertedTokens = sub.tokens
        ? await Promise.all(
            sub.tokens
              .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
              .map(async token => {
                const convertedToken = await kuroshiro!.convert(token.surface_form, { to: script });
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