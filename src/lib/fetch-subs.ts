import { Format, Mode, Sub, Token } from "@/app/types";
import * as kuromoji from "kuromoji";
// @ts-ignore
import Kuroshiro from "kuroshiro";
// @ts-ignore
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

// Global instances to avoid re-initialization
let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let kuroshiro: any = null;

export async function fetchSub(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

export async function parseSubToJson({ url, format, mode }: { url: string, format: Format, mode: Mode }) {
  const content = await fetchSub(url);
  
  switch (format) {
    case 'srt':
      const subs = parseSrt(content);
      
      // Initialize required tools once
      await initializeProcessors(mode);
      
      if (mode === 'japanese') {
        // Only tokenize for Japanese mode
        return tokenizeSubs(subs);
      } else {
        // For other modes, convert and tokenize in one pass
        return processSubsForNonJapaneseMode(subs, mode);
      }
    default:
      throw new Error(`Unsupported subtitle format: ${format}`);
  }
}

async function initializeProcessors(mode: Mode) {
  // Initialize tokenizer if not already done
  if (!tokenizer) {
    tokenizer = await createTokenizer();
  }
  
  // Initialize kuroshiro if not already done (for non-japanese modes only)
  if (!kuroshiro && mode != 'japanese') {
    kuroshiro = new Kuroshiro();
    const analyzer = new KuromojiAnalyzer({ dictPath: "/dict" });
    await kuroshiro.init(analyzer);
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

function tokenizeSubs(subs: Sub[]) {
  if (!tokenizer) {
    throw new Error("Tokenizer not initialized");
  }
  
  return subs.map(sub => ({
    ...sub,
    tokens: tokenizer!.tokenize(sub.content || '')
      .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
  }));
}

async function processSubsForNonJapaneseMode(subs: Sub[], mode: Mode) {
  if (!kuroshiro || !tokenizer) {
    throw new Error("Processors not initialized");
  }
  
  return Promise.all(
    subs.map(async sub => {
      // Convert to the target script
      const convertedContent = await kuroshiro.convert(sub.content, { to: mode });
      
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
  let cleanedContent = content.replace(/\{\\an\d+\}/g, '');
  
  return cleanedContent;
}

function parseSrt(content: string) {
  const lines = content.split('\n');
  const result = [];
  
  let currentEntry: Partial<Sub> = {}
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
  
  return result as Sub[];
}