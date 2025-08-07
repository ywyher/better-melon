'use client'

import useIsTranscriptionsCached from "@/lib/hooks/use-is-transcriptions-cached";
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
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { useLearningStore } from "@/lib/stores/learning-store";
import { useMediaHistory } from "@/lib/hooks/use-media-history";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { useStreamingData } from "@/lib/hooks/use-streaming-data";
import { StreamingData } from "@better-melon/shared/types";

export const useWatchData = (animeId: Anime['id'], episodeNumber: number) => {
  const loadStartTimeRef = useRef<number>(performance.now());
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const setDelay = useDelayStore((state) => state.setDelay)

  const streamingStore = useStreamingStore();
  const settingsStore = useSettingsStore();
  const transcriptionStore = useTranscriptionStore();
  const learningStore = useLearningStore();

  const currentStreamingState = useStreamingStore.getState();
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
    streamingData,
    isLoading: isStreamingDataLoading,
    error: streamingDataError,
    loadingDuration: streamingDataLoadingDuration,
    refetch: refetchStreamingData
  } = useStreamingData(animeId, episodeNumber);

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
    isLoading: isMediaHistoryLoading,
    error: isMediaHistoryError,
    loadingDuration: mediaHistoryLoadingDuration
  } = useMediaHistory({
    mediaEpisode: episodeNumber,
    mediaId: animeId
  });

  const {
    subtitlesError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitlesErrors
  } = useSetSubtitles({
    streamingData,
    preferredFormat: settings.subtitleSettings.preferredFormat || "srt",
    episodeNumber,
    cachedFiles
  });

  // Update episode store
  useEffect(() => {
    const updates: Partial<{
      animeId: number;
      episodeNumber: number;
      streamingData: StreamingData;
      episodesLength: number;
    }> = {};
    
    if (hasChanged(animeId, currentStreamingState.animeId)) {
      updates.animeId = animeId;
      setDelay({
        english: 0,
        japanese: 0
      });
    }
    
    if (hasChanged(episodeNumber, currentStreamingState.episodeNumber)) {
      updates.episodeNumber = episodeNumber;
    }
    
    if (hasChanged(streamingData, currentStreamingState.streamingData)) {
      updates.streamingData = streamingData;
    }
    
    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      console.log('Batch updating episode store with:', Object.keys(updates));
      streamingStore.batchUpdate(updates);
    }
  }, [animeId, episodeNumber, streamingData]);

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
      isStreamingDataLoading ||
      isSettingsLoading ||
      isWordsLoading ||
      isMediaHistoryLoading ||
      (isTranscriptionsLoading && !hasInitialized) ||
      (isStylesLoading && !hasInitialized)
    );
  }, [
    isStreamingDataLoading,
    isSettingsLoading,
    isWordsLoading,
    isPitchAccentLoading,
    isMediaHistoryLoading,
    isTranscriptionsLoading,
    isStylesLoading,
    hasInitialized
  ]);

  // Update watch store
  useEffect(() => {
    if (hasChanged(isLoading, currentStreamingState.isLoading)) {
      streamingStore.setIsLoading(isLoading);
    }
    
    if (!isLoading && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isLoading, hasInitialized]);

  useEffect(() => {
    if (!isLoading &&
        streamingDataLoadingDuration >= 0 &&
        transcriptionsLoadingDuration >= 0 &&
        settingsLoadingDuration >= 0 &&
        stylesLoadingDuration >= 0 && 
        mediaHistoryLoadingDuration >= 0 && 
        wordsLoadingDuration >= 0 &&
        pitchAccentLoadingDuration >= 0 
    ) {
      const loadEndTime = performance.now();
      const elapsed = loadEndTime - loadStartTimeRef.current;
      
      if (hasChanged(elapsed, currentStreamingState.loadingDuration)) {
        setTotalDuration(elapsed);
        streamingStore.setLoadingDuration(elapsed);
      }
    }
  }, [
    isLoading,
    streamingDataLoadingDuration,
    transcriptionsLoadingDuration,
    settingsLoadingDuration,
    stylesLoadingDuration,
    mediaHistoryLoadingDuration,
    wordsLoadingDuration,
    pitchAccentLoadingDuration,
  ]);

  const errors = useMemo(() => {
    return [
      streamingDataError,
      transcriptionsError,
      settingsError,
      stylesError,
      subtitlesError,
      isMediaHistoryError,
      wordsError,
      pitchAccentError
    ].filter(Boolean);
  }, [
    streamingDataError,
    transcriptionsError,
    settingsError,
    stylesError,
    subtitlesError,
    isMediaHistoryError,
    wordsError,
    pitchAccentError
  ]);

  useEffect(() =>{ 
    console.log(`test streamingStore`, streamingStore )
    console.log(`test settingsStore`, settingsStore )
    console.log(`test transcriptionStore`, transcriptionStore )
    console.log(`test learningStore`, learningStore )
  }, [streamingStore, settingsStore, transcriptionStore, learningStore])

  return {
    streaming: {
      data: streamingData,
      isLoading: isStreamingDataLoading,
      error: streamingDataError,
      loadingDuration: streamingDataLoadingDuration,
      refetch: refetchStreamingData
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