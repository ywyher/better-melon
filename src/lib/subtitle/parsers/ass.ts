import { removeTags, timestampToSeconds } from "@/lib/utils/subtitle";
import { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";

export function parseAss(content: string, transcription: SubtitleTranscription): SubtitleCue[] {
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

  return result as SubtitleCue[];
}