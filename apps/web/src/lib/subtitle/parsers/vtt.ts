import { removeHtmlTags, timestampToSeconds } from "@/lib/utils/subtitle";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";

export function parseVtt(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
  const parseVttStart = performance.now();
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

  const parseVttEnd = performance.now();
  console.info(`[Parsing(${transcription})] VTT parsing completed in ${Math.round(parseVttEnd - parseVttStart)}ms - ${result.length} cues parsed`);
  return result as SubtitleCue[];
}