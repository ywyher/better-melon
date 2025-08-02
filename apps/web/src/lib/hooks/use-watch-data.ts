'use client'

import useIsTranscriptionsCached from "@/lib/hooks/use-is-transcriptions-cached";
import { useEpisodeData } from "@/lib/hooks/use-episode-data";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";
import { useSetSubtitles } from "@/lib/hooks/use-set-subtitles";
import { useSettingsForEpisode } from "@/lib/hooks/use-settings-for-episode";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useWords } from "@/lib/hooks/use-words";
import { hasChanged } from "@/lib/utils/utils";
import { Anime } from "@/types/anime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDelayStore } from "@/lib/stores/delay-store";
import { useWatchStore } from "@/lib/stores/watch-store";
import { useEpisodeStore } from "@/lib/stores/episode-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { useLearningStore } from "@/lib/stores/learning-store";

export const useWatchData = (animeId: Anime['id'], episodeNumber: number) => {
  const loadStartTimeRef = useRef<number>(performance.now());
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const setDelay = useDelayStore((state) => state.setDelay)

  const watchStore = useWatchStore();
  const episodeStore = useEpisodeStore();
  const settingsStore = useSettingsStore();
  const transcriptionStore = useTranscriptionStore();
  const learningStore = useLearningStore();

  const currentWatchState = useWatchStore.getState();
  const currentEpisodeState = useEpisodeStore.getState();
  const currentSettingsState = useSettingsStore.getState();
  const currentTranscriptionState = useTranscriptionStore.getState();
  const currentLearningState = useLearningStore.getState();

  const {
    cachedFiles,
    isCached: isTranscriptionsCached,
    isLoading: isTranscriptionsCachedLoading
  } = useIsTranscriptionsCached({
    animeId,
    episodeNumber
  });

  const shouldInitializeTokenizer = useMemo(() => {
    return (!isTranscriptionsCached && !isTranscriptionsCachedLoading) || hasInitialized;
  }, [isTranscriptionsCached, isTranscriptionsCachedLoading, hasInitialized]);

  const { isInitialized: isTokenizerInitialized } = useInitializeTokenizer({ shouldInitialize: shouldInitializeTokenizer });

  const {
    episodeData,
    isLoading: isEpisodeDataLoading,
    error: episodeDataError,
    loadingDuration: episodeDataLoadingDuration,
    episodesLength,
    refetch: refetchEpisodeData
  } = useEpisodeData(animeId, episodeNumber);

  const {
    settings,
    isLoading: isSettingsLoading,
    error: settingsError,
    loadingDuration: settingsLoadingDuration
  } = useSettingsForEpisode();

  const { 
    transcriptions, 
    isLoading: isTranscriptionsLoading,
    transcriptionsLookup,
    error: transcriptionsError,
    loadingDuration: transcriptionsLoadingDuration,
  } = useSubtitleTranscriptions({
    shouldFetch: isTranscriptionsCached || isTokenizerInitialized,
    animeId,
    episodeNumber
  });

  const { 
    isLoading: isStylesLoading, 
    error: stylesError,
    loadingDuration: stylesLoadingDuration 
  } = useSubtitleStyles();

  const { 
    pitchLookup,
    isLoading: isPitchAccentLoading,
    loadingDuration: pitchAccentLoadingDuration,
    error: pitchAccentError
  } = usePitchAccentChunks({
    animeId,
    japaneseCues: transcriptions?.find(t => t.transcription == 'japanese')?.cues || [],
    shouldFetch: settings?.wordSettings.pitchColoring || false
  });
  
  const { 
    wordsLookup,
    isLoading: isWordsLoading,
    error: wordsError,
    loadingDuration: wordsLoadingDuration
  } = useWords({
    shouldFetch: settings?.wordSettings.learningStatus || false
  });

  const {
    subtitlesError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitlesErrors
  } = useSetSubtitles({
    episodeData,
    settings,
    episodeNumber,
    cachedFiles
  });

  // Update episode store
  useEffect(() => {
    const updates: Partial<{
      animeId: number;
      episodeNumber: number;
      episodeData: any;
      episodesLength: number;
    }> = {};
    
    if (hasChanged(animeId, currentEpisodeState.animeId)) {
      updates.animeId = animeId;
      setDelay({
        english: 0,
        japanese: 0
      });
    }
    
    if (hasChanged(episodeNumber, currentEpisodeState.episodeNumber)) {
      updates.episodeNumber = episodeNumber;
    }
    
    if (hasChanged(episodeData, currentEpisodeState.episodeData)) {
      updates.episodeData = episodeData;
    }
    
    if (hasChanged(episodesLength, currentEpisodeState.episodesLength)) {
      updates.episodesLength = episodesLength;
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating episode store with:', Object.keys(updates));
      episodeStore.batchUpdate(updates);
    }
  }, [animeId, episodeNumber, episodeData, episodesLength]);

  // Update settings store
  useEffect(() => {
    if (hasChanged(settings, {
      generalSettings: currentSettingsState.general,
      playerSettings: currentSettingsState.player,
      subtitleSettings: currentSettingsState.subtitle,
      wordSettings: currentSettingsState.word,
    })) {
      if (settings) {
        console.log('Batch updating settings store with:', Object.keys(settings));
        settingsStore.batchUpdate(settings);
      }
    }
  }, [settings]);

  // Update transcription store
  useEffect(() => {
    const updates: Partial<{
      transcriptions: any;
      transcriptionsLookup: any;
      transcriptionsStyles: any;
    }> = {};
    
    if (hasChanged(transcriptions, currentTranscriptionState.transcriptions)) {
      updates.transcriptions = transcriptions;
    }
    
    if (hasChanged(transcriptionsLookup, currentTranscriptionState.transcriptionsLookup)) {
      updates.transcriptionsLookup = transcriptionsLookup;
    }
    
    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating transcription store with:', Object.keys(updates));
      transcriptionStore.batchUpdate(updates);
    }
  }, [transcriptions, transcriptionsLookup]);

  // Update learning store
  useEffect(() => {
    const updates: Partial<{
      pitchLookup: any;
      wordsLookup: any;
    }> = {};
    
    if (hasChanged(pitchLookup, currentLearningState.pitchLookup)) {
      updates.pitchLookup = pitchLookup;
    }
    
    if (hasChanged(wordsLookup, currentLearningState.wordsLookup)) {
      updates.wordsLookup = wordsLookup;
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating learning store with:', Object.keys(updates));
      learningStore.batchUpdate(updates);
    }
  }, [pitchLookup, wordsLookup]);

  const isLoading = useMemo(() => {
    return (
      isEpisodeDataLoading ||
      isSettingsLoading ||
      isWordsLoading ||
      (isTranscriptionsLoading && !hasInitialized) ||
      (isStylesLoading && !hasInitialized)
    );
  }, [
    isEpisodeDataLoading,
    isSettingsLoading,
    isWordsLoading,
    isPitchAccentLoading,
    isTranscriptionsLoading,
    isStylesLoading,
    hasInitialized
  ]);

  // Update watch store
  useEffect(() => {
    if (hasChanged(isLoading, currentWatchState.isLoading)) {
      watchStore.setIsLoading(isLoading);
    }
    
    if (!isLoading && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isLoading, hasInitialized]);

  useEffect(() => {
    if (!isLoading &&
        episodeDataLoadingDuration >= 0 &&
        transcriptionsLoadingDuration >= 0 &&
        settingsLoadingDuration >= 0 &&
        stylesLoadingDuration >= 0 && 
        wordsLoadingDuration >= 0 &&
        pitchAccentLoadingDuration >= 0 
    ) {
      const loadEndTime = performance.now();
      const elapsed = loadEndTime - loadStartTimeRef.current;
      
      if (hasChanged(elapsed, currentWatchState.loadingDuration)) {
        setTotalDuration(elapsed);
        watchStore.setLoadingDuration(elapsed);
      }
    }
  }, [
    isLoading,
    episodeDataLoadingDuration,
    transcriptionsLoadingDuration,
    settingsLoadingDuration,
    stylesLoadingDuration,
    wordsLoadingDuration,
    pitchAccentLoadingDuration,
  ]);

  const errors = useMemo(() => {
    return [
      episodeDataError,
      transcriptionsError,
      settingsError,
      stylesError,
      subtitlesError,
      wordsError,
      pitchAccentError
    ].filter(Boolean);
  }, [
    episodeDataError,
    transcriptionsError,
    settingsError,
    stylesError,
    subtitlesError,
    wordsError,
    pitchAccentError
  ]);

  return {
    episode: {
      data: episodeData,
      isLoading: isEpisodeDataLoading,
      error: episodeDataError,
      loadingDuration: episodeDataLoadingDuration,
      episodesLength,
      refetch: refetchEpisodeData
    },
    settings: {
      data: settings,
      isLoading: isSettingsLoading,
      error: settingsError,
      loadingDuration: settingsLoadingDuration
    },
    transcriptions: {
      data: transcriptions,
      isLoading: isTranscriptionsLoading,
      error: transcriptionsError,
      loadingDuration: transcriptionsLoadingDuration,
      lookup: transcriptionsLookup
    },
    styles: {
      isLoading: isStylesLoading,
      error: stylesError,
      loadingDuration: stylesLoadingDuration
    },
    pitchAccent: {
      lookup: pitchLookup,
      isLoading: isPitchAccentLoading,
      error: pitchAccentError,
      loadingDuration: pitchAccentLoadingDuration
    },
    words: {
      lookup: wordsLookup,
      isLoading: isWordsLoading,
      error: wordsError,
      loadingDuration: wordsLoadingDuration
    },
    subtitles: {
      error: subtitlesError,
      reset: resetSubtitlesErrors,
      errorDialog: subtitlesErrorDialog,
      setErrorDialog: setSubtitlesErrorDialog,
    },
    duration: {
      total: totalDuration,
      set: setTotalDuration,
    },
    isLoading,
    errors,
    loadStartTimeRef
  };
};