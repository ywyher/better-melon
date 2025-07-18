'use client'

import { useEpisodeData } from "@/lib/hooks/use-episode-data";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import useIsTranscriptionsCached from "@/lib/hooks/use-is-transcriptions-cached";
import { usePitchAccentChunks } from "@/lib/hooks/use-pitch-accent-chunks";
import { useSetSubtitles } from "@/lib/hooks/use-set-subtitles";
import { useSettingsForEpisode } from "@/lib/hooks/use-settings-for-episode";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useWords } from "@/lib/hooks/use-words";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { hasChanged } from "@/lib/utils/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export const useWatchData = (animeId: string, episodeNumber: number) => {
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const loadStartTimeRef = useRef<number>(performance.now());
  const [hasInitialized, setHasInitialized] = useState<boolean>(false)
  const [totalDuration, setTotalDuration] = useState<number>(0);

  // Get store actions
  const {
    setAnimeId,
    setEpisodeNumber,
    setEpisodeData,
    setEpisodesLength,
    setSettings,
    setTranscriptions,
    setTranscriptionsLookup,
    setStyles,
    setPitchLookup,
    setWordsLookup,
    setIsLoading,
    setLoadingDuration
  } = useWatchDataStore();

  const store = useWatchDataStore.getState(); // use this to read current store values (won't trigger re-renders)
  const {
    cachedFiles,
    isCached,
    isLoading: isTranscriptionsCachedLoading
  } = useIsTranscriptionsCached({
    animeId: "97986",
    episodeNumber: 9
  })

  const shouldInitializeTokenizer = useMemo(() => {
    return (!isCached && !isTranscriptionsCachedLoading) || hasInitialized;
  }, [isCached, isTranscriptionsCachedLoading, hasInitialized])
  
  const { isInitialized } = useInitializeTokenizer({ shouldInitialize: shouldInitializeTokenizer });

  const {
    episodeData,
    isLoading: isEpisodeDataLoading,
    error: episodeDataError,
    loadingDuration: episodeDataLoadingDuration,
    episodesLength,
    refetch: refetchEpisodeData
  } = useEpisodeData(animeId, episodeNumber);

  const { 
    transcriptions, 
    isLoading: isTranscriptionsLoading,
    transcriptionsLookup,
    error: transcriptionsError,
    loadingDuration: transcriptionsLoadingDuration,
  } = useSubtitleTranscriptions({
    shouldFetch: isCached || isInitialized,
    animeId,
    episodeNumber
  });

  const {
    settings,
    isLoading: isSettingsLoading,
    error: settingsError,
    loadingDuration: settingsLoadingDuration
  } = useSettingsForEpisode()

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
  })
  
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

  const isLoading = useMemo(() => {
    return (
      isEpisodeDataLoading
      || isSettingsLoading 
      || isWordsLoading
      // || !isVideoReady
      // so when the user add other transcriptions later we don't show the loading state
      || (isPitchAccentLoading && !hasInitialized)
      || (isTranscriptionsLoading && !hasInitialized)
      || (isStylesLoading && !hasInitialized)
    );
  }, [isEpisodeDataLoading, isTranscriptionsLoading, isStylesLoading, isPitchAccentLoading, isSettingsLoading, isWordsLoading]);

  useEffect(() => {
    console.log(`isLoading`, {
      isEpisodeDataLoading,
      isSettingsLoading ,
      isWordsLoading,
      isPitchAccentLoading: (isPitchAccentLoading && !hasInitialized),
      isTranscriptionsLoading: (isTranscriptionsLoading && !hasInitialized),
      isStylesLoading: (isStylesLoading && !hasInitialized),
      isVideoReady
    })
  }, [
    isEpisodeDataLoading,
    isStylesLoading ,
    isSettingsLoading ,
    isWordsLoading,
    isPitchAccentLoading,
    isTranscriptionsLoading,
    hasInitialized,
    isStylesLoading,
  ])

  const errors = useMemo(() => {
    return [
      episodeDataError,
      transcriptionsError,
      settingsError,
      stylesError,
      subtitlesError,
      wordsError,
      pitchAccentError
    ].filter(Boolean)
  }, [episodeDataError, transcriptionsError, settingsError, stylesError, subtitlesError]);

  useEffect(() => {
    if (animeId && hasChanged(animeId, store.animeId)) {
      setAnimeId(animeId);
    }
  }, [episodeData]);

  useEffect(() => {
    if (episodeNumber && hasChanged(episodeNumber, store.episodeNumber)) {
      setEpisodeNumber(episodeNumber);
    }
  }, [episodeData]);

  useEffect(() => {
    if (episodeData && hasChanged(episodeData, store.episodeData)) {
      setEpisodeData(episodeData);
    }
  }, [episodeData]);

  useEffect(() => {
    if (episodesLength !== store.episodesLength) {
      setEpisodesLength(episodesLength);
    }
  }, [episodesLength]);

  useEffect(() => {
    if (settings && hasChanged(settings, store.settings)) {
      setSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  useEffect(() => {
    if (transcriptionsLookup && hasChanged(transcriptionsLookup, store.transcriptionsLookup)) {
      setTranscriptionsLookup(transcriptionsLookup);
    }
  }, [transcriptionsLookup]);

  useEffect(() => {
    if (styles && hasChanged(styles, store.styles)) {
      setStyles(styles);
    }
  }, [styles]);


  useEffect(() => {
    if (pitchLookup && hasChanged(pitchLookup, store.pitchLookup)) {
      setPitchLookup(pitchLookup);
    }
  }, [pitchLookup]);

  useEffect(() => {
    if (wordsLookup && hasChanged(wordsLookup, store.wordsLookup)) {
      setWordsLookup(wordsLookup);
    }
  }, [wordsLookup]);

  useEffect(() => {
    if (isLoading !== store.isLoading) {
      setIsLoading(isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isLoading, hasInitialized]);

  useEffect(() => {
    if (totalDuration !== store.loadingDuration) {
      setLoadingDuration(totalDuration);
    }
  }, [totalDuration]);

  useEffect(() => {
    if (!isLoading &&
      isVideoReady &&
      episodeDataLoadingDuration >= 0 &&
      transcriptionsLoadingDuration >= 0 &&
      settingsLoadingDuration >= 0 &&
      stylesLoadingDuration >= 0 && 
      wordsLoadingDuration >= 0 &&
      pitchAccentLoadingDuration >=0 
    ) {
      const loadEndTime = performance.now();
      const elapsed = loadEndTime - loadStartTimeRef.current;
      setTotalDuration(elapsed);
      setLoadingDuration(elapsed);
    }
  }, [
    isLoading,
    isVideoReady,
    episodeDataLoadingDuration,
    transcriptionsLoadingDuration,
    settingsLoadingDuration,
    stylesLoadingDuration,
    episodeNumber,
    setLoadingDuration
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
  }
};