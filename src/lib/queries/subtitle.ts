import { getSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/actions";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { parseSubtitleToJson } from "@/lib/subtitle";
import type { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQueries, useQuery } from "@tanstack/react-query";

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

export const useSubtitleTranscriptions = () => {
    const englishSubtitleUrl = usePlayerStore((state) => state.englishSubtitleUrl) || "";
    const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);
    const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);

    const addSubtitleStylesInStore = useSubtitleStylesStore((state) => state.addStyles);

    const queryConfig = ({
      queries: subtitleTranscriptions.map(transcription => {
          const isEnglish = transcription === 'english';
          const source = isEnglish 
              ? englishSubtitleUrl 
              : activeSubtitleFile?.source === 'remote'
                  ? activeSubtitleFile?.file.url 
                  : activeSubtitleFile?.file;

          return {
              queryKey: ['subtitle', 'transcriptions', transcription, source],
              queryFn: async () => {
                  if (((isEnglish && !englishSubtitleUrl) || !source) || 
                      (!isEnglish && activeSubtitleFile?.source === 'remote' ? !activeSubtitleFile?.file.url : !activeSubtitleFile?.file)) {
                      throw new Error(`Couldn't get the file for ${transcription} subtitles`);
                  }
                  
                  const format = isEnglish 
                      ? englishSubtitleUrl.split('.').pop() as "srt" | "vtt"
                      : activeSubtitleFile?.source === 'remote' 
                          ? activeSubtitleFile.file.url.split('.').pop() as "srt" | "vtt"
                          : activeSubtitleFile?.file.name.split('.').pop() as "srt" | "vtt";

                  // Fetch styles once at the beginning
                  let styles = await getSubtitleStyles({ transcription });

                  if(JSON.stringify(styles) === JSON.stringify(defaultSubtitleStyles)) {
                      styles = await getSubtitleStyles({ transcription: 'all' });
                      addSubtitleStylesInStore('all', styles);
                  } else {
                      addSubtitleStylesInStore(transcription, styles);
                  }
                  
                  const cues = await parseSubtitleToJson({ 
                      source,
                      format,
                      transcription
                  });
                  
                  return {
                      transcription,
                      format,
                      cues
                  };
              },
              staleTime: 1000 * 60 * 60,
              enabled: !!source && activeTranscriptions.includes(transcription),
          };
      })
  });

  return useQueries(queryConfig)
}