import { StyleTranscription, TranscriptionStyleSet } from "@/app/watch/[id]/[ep]/types";
import { getMultipleTranscriptionsStyles } from "@/components/subtitle/styles/actions";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { SubtitleStyles } from "@/lib/db/schema";
import { SubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { parseSubtitlesFile } from "@/lib/subtitle/parse";
import { convertToKana, getSubtitleFormat, getSubtitleSource } from "@/lib/utils/subtitle";
import { Anime } from "@/types/anime";
import type { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { Dispatch, RefObject, SetStateAction } from "react";


export const subtitleQueries = createQueryKeys('subtitle', {
  cues: ({
    activeSubtitleFile,
    animeId,
    episodeNumber,
    transcription
  }: {
    activeSubtitleFile: ActiveSubtitleFile,
    transcription: SubtitleTranscription,
    animeId: Anime['id'],
    episodeNumber: number
  }) => ({
    queryKey: ['cues', activeSubtitleFile, transcription],
    queryFn: async () => {
      if (!activeSubtitleFile) return undefined;
  
      const source = getSubtitleSource(false, '', activeSubtitleFile);
      const format = getSubtitleFormat(false, '', activeSubtitleFile);
      
      return await parseSubtitlesFile({
        format,
        source,
        transcription,
        animeId,
        episodeNumber
      })
    }
  }),
  transcriptions: ({ activeSubtitleFile, englishSubtitleUrl, transcription, isEnglish, shouldFetch, animeId, episodeNumber }: {
    activeSubtitleFile?: ActiveSubtitleFile;
    englishSubtitleUrl: string;
    transcription: SubtitleTranscription;
    isEnglish: boolean;
    shouldFetch: boolean,
    animeId: Anime['id'],
    episodeNumber: number
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

    if (!activeSubtitleFile && !englishSubtitleUrl) {
      throw new Error(`No subtitle source available`);
    }
    
    if (!activeSubtitleFile) {
      throw new Error(`Active subtitle file is null`);
    }
    
    if (!shouldFetch) {
      throw new Error(`Should fetch is false`);
    }
    
    const source = getSubtitleSource(isEnglish, englishSubtitleUrl, activeSubtitleFile);
    const format = getSubtitleFormat(isEnglish, englishSubtitleUrl, activeSubtitleFile);

    const startParsing = performance.now()
    const cues = await parseSubtitlesFile({
      format,
      source,
      transcription,
      animeId,
      episodeNumber
    })
    const endParsing = performance.now()
    console.log(`[ParseSubtitlesFile(${transcription})] Took -> ${(endParsing - startParsing).toFixed(2)}ms`)

    return {
      transcription,
      format,
      cues
    };
  },
  }),
  styles: ({ transcriptionsToFetch, setLoadingDuration }: {
    transcriptionsToFetch: StyleTranscription[];
    setLoadingDuration?: Dispatch<SetStateAction<number>>
  }) => ({
    queryKey: ['subtitle', 'styles', transcriptionsToFetch],
    queryFn: async () => {
      const start = performance.now();
      const stylesMap = await getMultipleTranscriptionsStyles(transcriptionsToFetch);
      
      const end = performance.now();
      const duration = end - start;
      if(setLoadingDuration) setLoadingDuration(duration);
      console.log(`~Subtitle styles fetched in ${duration.toFixed(2)}ms for ${transcriptionsToFetch.length} transcriptions`);
      
      return stylesMap as Record<StyleTranscription, {
        active: SubtitleStyles;
        default: SubtitleStyles;
      }>;
    }
  }),
  toKana: (sentence: string) => ({
    queryKey: ['toKana', sentence],
    queryFn: async () => {
      return convertToKana(sentence)
    }
  })
});