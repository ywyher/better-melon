import { removeHtmlTags, timestampToSeconds } from "@/lib/utils/subtitle";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";

export function parseVtt(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
  const parseVttStart = performance.now();
  const normalizedContent = normalizeVttTimestamps(content);

  const lines = normalizedContent.split('\n');
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

  console.log({
    id: result[0].id,
    from: result[0].from,
    to: result[0].to
  })

  const parseVttEnd = performance.now();
  console.info(`[Parsing(${transcription})] VTT parsing completed in ${Math.round(parseVttEnd - parseVttStart)}ms - ${result.length} cues parsed`);
  return result as SubtitleCue[];
}


export function normalizeVttTimestamps(content: string): string {
  const lines = content.split('\n');
  
  // Check if any line has the malformed timestamp format (MM:SS.SSS)
  const hasMalformedTimestamps = lines.some(line => {
    const malformedPattern = /^\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}/;
    return malformedPattern.test(line.trim());
  });
  
  if (!hasMalformedTimestamps) {
    return content;
  }
  
  const normalizedLines = lines.map(line => {
    const trimmedLine = line.trim();
    
    // Match the malformed timestamp pattern (MM:SS.SSS --> MM:SS.SSS)
    const malformedMatch = trimmedLine.match(/^(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2})\.(\d{3})(.*)$/);
    
    if (malformedMatch) {
      const [, startMin, startSec, startMs, endMin, endSec, endMs, rest] = malformedMatch;
      
      // Convert to HH:MM:SS.SSS format (prepend 00: for hours)
      const normalizedStart = `00:${startMin}:${startSec}.${startMs}`;
      const normalizedEnd = `00:${endMin}:${endSec}.${endMs}`;
      
      return `${normalizedStart} --> ${normalizedEnd}${rest}`;
    }
    
    return line;
  });
  
  return normalizedLines.join('\n');
}