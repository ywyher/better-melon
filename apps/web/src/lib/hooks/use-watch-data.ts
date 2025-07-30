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
import { useWatchDataStore, WatchDataState } from "@/lib/stores/watch-store";
import { hasChanged } from "@/lib/utils/utils";
import { Anime } from "@/types/anime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDelayStore } from "@/lib/stores/delay-store";

export const useWatchData = (animeId: Anime['id'], episodeNumber: number) => {
  const loadStartTimeRef = useRef<number>(performance.now());
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const setDelay = useDelayStore((state) => state.setDelay)

  const store = useWatchDataStore();
  const currentStoreState = useWatchDataStore.getState();

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
    // isTranscriptionsCached => since we wont need the tokenizer so its faster
    shouldFetch: isTranscriptionsCached || isTokenizerInitialized,
    animeId,
    episodeNumber
  });

  const { 
    styles, 
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

  useEffect(() => {
    const updates: Partial<WatchDataState> = {};
    
    if (hasChanged(animeId, currentStoreState.animeId)) {
      updates.animeId = animeId;
      setDelay({
        english: 0,
        japanese: 0
      })
    }
    
    if (hasChanged(episodeNumber, currentStoreState.episodeNumber)) {
      updates.episodeNumber = episodeNumber;
    }
    
    if (hasChanged(episodeData, currentStoreState.episodeData)) {
      updates.episodeData = episodeData;
    }
    
    if (hasChanged(episodesLength, currentStoreState.episodesLength)) {
      updates.episodesLength = episodesLength;
    }
    
    if (hasChanged(settings, currentStoreState.settings)) {
      updates.settings = settings;
    }
    
    if (hasChanged(transcriptions, currentStoreState.transcriptions)) {
      updates.transcriptions = transcriptions;
    }
    
    if (hasChanged(transcriptionsLookup, currentStoreState.transcriptionsLookup)) {
      updates.transcriptionsLookup = transcriptionsLookup;
    }
    
    if (hasChanged(styles, currentStoreState.styles)) {
      updates.styles = styles;
    }
    
    if (hasChanged(pitchLookup, currentStoreState.pitchLookup)) {
      updates.pitchLookup = pitchLookup;
    }
    
    if (hasChanged(wordsLookup, currentStoreState.wordsLookup)) {
      updates.wordsLookup = wordsLookup;
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating store with:', Object.keys(updates));
      store.batchUpdate(updates);
    }
  }, [
    animeId,
    episodeNumber,
    episodeData,
    episodesLength,
    settings,
    transcriptions,
    transcriptionsLookup,
    styles,
    pitchLookup,
    wordsLookup,
    store.batchUpdate
  ]);

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

  useEffect(() => {
    if (hasChanged(isLoading, currentStoreState.isLoading)) {
      store.setIsLoading(isLoading);
    }
    
    if (!isLoading && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isLoading, hasInitialized, store.setIsLoading]);

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
      
      if (hasChanged(elapsed, currentStoreState.loadingDuration)) {
        setTotalDuration(elapsed);
        store.setLoadingDuration(elapsed);
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
    store.setLoadingDuration
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
      data: styles,
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