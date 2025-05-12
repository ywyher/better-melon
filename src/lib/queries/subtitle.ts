import { parseSubtitleToJson } from "@/lib/subtitle/parse";
import type { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const subtitleQueries = createQueryKeys('subtitle', {
  cues: (activeSubtitleFile: ActiveSubtitleFile, transcription: SubtitleTranscription) => ({
    queryKey: ['cues', activeSubtitleFile, transcription],
    queryFn: async () => {
      if (!activeSubtitleFile) return undefined;
  
      const format = activeSubtitleFile.source === 'remote' 
        ? activeSubtitleFile.file.url.split('.').pop() as "srt" | "vtt"
        : activeSubtitleFile.file.name.split('.').pop() as "srt" | "vtt";

      return await parseSubtitleToJson({ 
        source: activeSubtitleFile.source === 'remote' 
          ? activeSubtitleFile.file.url 
          : activeSubtitleFile.file,
        format,
        transcription
      });
    }
  })
});