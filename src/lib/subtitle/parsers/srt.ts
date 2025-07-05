import { removeTags, timestampToSeconds } from "@/lib/utils/subtitle";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";

export function parseSrt(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
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

  return result as SubtitleCue[];
}