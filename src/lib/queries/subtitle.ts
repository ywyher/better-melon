import { parseSubtitleToJson } from "@/lib/subtitle";
import { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { queryOptions } from "@tanstack/react-query";

export function subtitleCuesOptions(
  transcription: SubtitleTranscription,
  activeSubtitleFile: ActiveSubtitleFile | null,
  shouldFetch: boolean
) {
  return queryOptions({
    queryKey: ['cues', transcription, activeSubtitleFile, shouldFetch],
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
    },
    enabled: !!activeSubtitleFile && shouldFetch
  });
}