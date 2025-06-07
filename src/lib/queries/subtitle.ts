import { getMultipleTranscriptionsStyles } from "@/components/subtitle/styles/actions";
import { SubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { parseSubtitleToJson } from "@/lib/subtitle/parse";
import { convertToKana, getSubtitleFormat, getSubtitleSource } from "@/lib/subtitle/utils";
import type { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { Dispatch, RefObject, SetStateAction } from "react";


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
  }),
  transcriptions: ({ activeSubtitleFile, englishSubtitleUrl, transcription, isEnglish, isTokenizerInitialized }: {
    activeSubtitleFile?: ActiveSubtitleFile;
    englishSubtitleUrl: string;
    transcription: SubtitleTranscription;
    isEnglish: boolean;
    isTokenizerInitialized: boolean
  }) => ({
    queryKey: [
      'subtitle',
      'transcriptions',
      activeSubtitleFile,
      transcription,
    ],
    queryFn: async () => {
      if ((isEnglish && !englishSubtitleUrl) 
        || (!isEnglish && !activeSubtitleFile)) {
        throw new Error(`Couldn't get the file for ${transcription} subtitles`);
      }

      if (!activeSubtitleFile) {
        throw new Error(`Active subtitle file is null`);
      }
      
      if (!isTokenizerInitialized) {
        throw new Error(`tokenizer isn't initialized`);
      }
      
      const source = getSubtitleSource(isEnglish, englishSubtitleUrl, activeSubtitleFile);
      const format = getSubtitleFormat(isEnglish, englishSubtitleUrl, activeSubtitleFile);
      
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
  }),
  styles: ({ transcriptionsToFetch, checkedTranscriptions, handleSubtitleStylesInStore, getStylesFromStore, setLoadingDuration }: {
    transcriptionsToFetch: SubtitleTranscription[];
    checkedTranscriptions: RefObject<Set<SubtitleTranscription>>;
    handleSubtitleStylesInStore: SubtitleStylesStore['handleStyles']
    getStylesFromStore: SubtitleStylesStore['getStyles'];
    setLoadingDuration?: Dispatch<SetStateAction<number>>
  }) => ({
    queryKey: ['subtitle', 'styles', transcriptionsToFetch,],
    queryFn: async () => {
      if (transcriptionsToFetch.length === 0) return {};
    
      const start = performance.now();
      const stylesMap = await getMultipleTranscriptionsStyles(transcriptionsToFetch);

      // Store fetched styles in the Zustand store, but only for transcriptions
      // that actually have styles in the database
      Object.entries(stylesMap).forEach(([transcription, styles]) => {
        // Handle default state if it exists
        if (styles.default) {
          handleSubtitleStylesInStore(
            transcription as SubtitleTranscription,
            styles.default,
            'default'
          );
        }
        
        // Handle active state if it exists
        if (styles.active) {
          handleSubtitleStylesInStore(
            transcription as SubtitleTranscription,
            styles.active,
            'active'
          );
        }
      });

      // Mark all checked transcriptions, even those without styles
      transcriptionsToFetch.forEach(transcription => {
        checkedTranscriptions.current.add(transcription);
      });
      
      const end = performance.now();
      const duration = end - start;
      if(setLoadingDuration) setLoadingDuration(duration);
      console.debug(`~Subtitle styles fetched and stored in ${duration.toFixed(2)}ms for ${transcriptionsToFetch.length} transcriptions`);
      
      return stylesMap;
    }
  }),
  toKana: (sentence: string) => ({
    queryKey: ['toKana', sentence],
    queryFn: async () => {
      return convertToKana(sentence)
    }
  })
});