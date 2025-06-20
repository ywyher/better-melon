import Kuroshiro from "@sglkc/kuroshiro";
import type { SubtitleCue, SubtitleTranscription, SubtitleToken, SubtitleFormat } from "@/types/subtitle";
import CustomKuromojiAnalyzer from "./custom-kuromoji-analyzer";
import { removeHtmlTags, removeTags, timestampToSeconds } from "@/lib/utils/subtitle";
import nlp from 'compromise';
import { SubtitleRequestBody } from "@/app/api/subtitles/parse/route";
import { readFileContent } from "@/lib/utils/utils";
import { Tokenizer } from "kuromojin";

export async function parseSubtitleToJson({
  source,
  format,
  transcription = 'japanese',
}: {
  source: string | File,
  format: SubtitleFormat,
  transcription: SubtitleTranscription
}): Promise<SubtitleCue[]> {
  // Prepare request body
  let requestBody: SubtitleRequestBody = {
    source: typeof source === 'string' ? source : source.name,
    format,
    transcription,
    isFile: typeof source !== 'string'
  };
  
  // If it's a file, read its content and include metadata
  if (typeof source !== 'string') {
    requestBody.fileContent = await readFileContent(source);
    requestBody.lastModified = source.lastModified;
  }

  const response = await fetch('/api/subtitles/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to parse subtitles');
  }
  
  const result = await response.json();
  return result.cues
}

export function processEnglishSubtitles(cues: SubtitleCue[]): SubtitleCue[] {
  return cues.map(sub => {
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

export async function convertSubtitlesForNonJapaneseTranscription(
  cues: SubtitleCue[], 
  transcription: SubtitleTranscription,
  tokenizer: Tokenizer
) {
  const kuroshiroStart = performance.now();
  const kuroshiro = new Kuroshiro();
  const analyzer = new CustomKuromojiAnalyzer({ tokenizer });
  await kuroshiro.init(analyzer);
  const kuroshiroEnd = performance.now();
  console.info(`~${transcription}-kuroshiroInitialization took: ${(kuroshiroEnd - kuroshiroStart).toFixed(2)}ms`);
  
  if (!kuroshiro) {
    throw new Error("Kuroshiro not initialized for transcription conversion");
  }

  const kuroshiroOptions = {
    to: transcription,
    mode: transcription === 'romaji' 
    ? 'spaced' 
    : transcription == 'furigana' 
    ? 'furigana'
    : 'normal' 
  }

  return Promise.all(
    cues.map(async sub => {
      if (!sub.content || !kuroshiro) {
        return sub;
      }
      
      const convertedContent = await kuroshiro.convert(sub.content, kuroshiroOptions);
      
      const convertedTokens = sub.tokens
        ? await Promise.all(
            sub.tokens
              .filter(token => token.surface_form !== ' ' && token.surface_form !== '　')
              .map(async token => {
                const convertedToken = await kuroshiro.convert(token.surface_form, kuroshiroOptions);
                return {
                  ...token,
                  original_form: token.surface_form,
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

export function parseSrt(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
  console.log('Parsing SRT content...');
  const lines = content.split('\n');
  const result = [];

  let currentEntry: Partial<SubtitleCue> = {};
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
      currentEntry.content = removeTags(initialContent);
      continue;
    }

    if (/^\d+$/.test(line) && !currentEntry.id) {
      currentEntry.id = parseInt(line);
      continue;
    }

    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

    if (timestampMatch) {
      currentEntry.from = timestampToSeconds(timestampMatch[1]);
      currentEntry.to = timestampToSeconds(timestampMatch[2]);
      isReadingContent = true;
      continue;
    }
  }

  if (Object.keys(currentEntry).length > 0) {
    result.push(currentEntry);
  }

  console.log('Finished parsing. Total entries:', result.length);
  return result as SubtitleCue[];
}

export function parseVtt(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
  console.log('Parsing VTT content...');
  const lines = content.split('\n');
  const result = [];

  let currentEntry: Partial<SubtitleCue> = {};
  let isReadingContent = false;
  let idCounter = 1;

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

    currentEntry.transcription = transcription;

    if (isReadingContent) {
      const initialContent = (currentEntry.content || '') +
        (currentEntry.content ? ' ' : '') + line;
      currentEntry.content = removeHtmlTags(initialContent);
      continue;
    }

    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);

    if (timestampMatch) {
      currentEntry.from = timestampToSeconds(timestampMatch[1]);
      currentEntry.to = timestampToSeconds(timestampMatch[2]);
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

  console.log('Finished parsing. Total entries:', result.length);
  return result as SubtitleCue[];
}

export function parseAss(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
  console.log('Parsing ASS content...');
  const lines = content.split('\n');
  const result = [];
  let idCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '') {
      continue;
    }

    if (line.startsWith("Dialogue:")) {
      const parts = line.split(',');

      if (parts.length >= 10) {
        const startTime = parts[1];
        const endTime = parts[2];
        const textParts = parts.slice(9);
        const content = textParts.join(',');

        if (!content) {
          continue;
        }

       const formatTimestamp = (timestamp: string) => {
          const trimmed = timestamp.trim();
          let formatted = trimmed;
          
          if (/^\d:/.test(trimmed)) {
            formatted = '0' + trimmed;
          }
          
          return formatted;
        };

        const entry: Partial<SubtitleCue> = {
          transcription: transcription,
          id: idCounter++,
          from: timestampToSeconds(formatTimestamp(startTime)),
          to: timestampToSeconds(formatTimestamp(endTime)),
          content: removeTags(content.trim()),
        };

        result.push(entry);
      }
    }
  }

  console.log('Finished parsing. Total entries:', result.length);
  return result as SubtitleCue[];
}