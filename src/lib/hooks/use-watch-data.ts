import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { useEpisodeData } from "@/lib/hooks/use-episode-data";
import { useProgressivePitchAccent } from "@/lib/hooks/use-progressive-pitch-accent";
import { useSetSubtitles } from "@/lib/hooks/use-set-subtitles";
import { useSettingsForEpisode } from "@/lib/hooks/use-settings-for-episode";
import { useSubtitleStyles } from "@/lib/hooks/use-subtitle-styles";
import { useSubtitleTranscriptions } from "@/lib/hooks/use-subtitle-transcriptions";
import { useWords } from "@/lib/hooks/use-words";
import { useSession } from "@/lib/queries/user";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { hasChanged } from "@/lib/utils/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export const useWatchData = (animeId: string, episodeNumber: number) => {
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const loadStartTimeRef = useRef<number>(performance.now());
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
  } = useSettingsForEpisode()

  const { 
    transcriptions, 
    isLoading: isTranscriptionsLoading,
    transcriptionsLookup,
    error: transcriptionsError,
    loadingDuration: transcriptionsLoadingDuration,
  } = useSubtitleTranscriptions();

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
  } = useProgressivePitchAccent(
    transcriptions?.find(t => t.transcription == 'japanese')?.cues,
    animeId,
  )
  
  const { 
    wordsLookup,
    isLoading: isWordsLoading,
    error: wordsError,
    loadingDuration: wordsLoadingDuration
  } = useWords()

  const {
    subtitlesError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitlesErrors
  } = useSetSubtitles(episodeData, settings, episodeNumber);

  const isLoading = useMemo(() => {
    return (
      isEpisodeDataLoading
      || isTranscriptionsLoading 
      || isStylesLoading 
      || isSettingsLoading 
      || isWordsLoading
      || isPitchAccentLoading
      // || !isVideoReady
    );
  }, [isEpisodeDataLoading, isTranscriptionsLoading, isStylesLoading, isPitchAccentLoading, isSettingsLoading, isWordsLoading]);

  useEffect(() => {
    console.log(`please`, {
      isEpisodeDataLoading,
      isTranscriptionsLoading,
      isStylesLoading,
      isSettingsLoading,
      isWordsLoading,
      isPitchAccentLoading,
      isVideoReady
    })
  }, [
    isEpisodeDataLoading,
    isTranscriptionsLoading,
    isStylesLoading,
    isSettingsLoading,
    isWordsLoading,
    isPitchAccentLoading,
    isVideoReady
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
    console.log(`animeId waiting`)
    if (animeId && hasChanged(animeId, store.animeId)) {
      console.log(`animeId passed`)
      setAnimeId(animeId);
    }
  }, [episodeData]);

  useEffect(() => {
    console.log(`episodeNumber waiting`)
    if (episodeNumber && hasChanged(episodeNumber, store.episodeNumber)) {
      console.log(`episodeNumber passed`)
      setEpisodeNumber(episodeNumber);
    }
  }, [episodeData]);

  useEffect(() => {
    console.log(`episodeData waiting`)
    if (episodeData && hasChanged(episodeData, store.episodeData)) {
      console.log(`episodeData passed`)
      setEpisodeData(episodeData);
    }
  }, [episodeData]);

  useEffect(() => {
    console.log(`episodesLength waiting`)
    if (episodesLength !== store.episodesLength) {
      console.log(`episodesLength passed`)
      setEpisodesLength(episodesLength);
    }
  }, [episodesLength]);

  useEffect(() => {
    console.log(`settings waiting`)
    if (settings && hasChanged(settings, store.settings)) {
      console.log(`settings passed`)
      setSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    console.log(`transcriptions waiting`)
    if (transcriptions && hasChanged(transcriptions, store.transcriptions)) {
      console.log(`transcriptions passed`)
      setTranscriptions(transcriptions);
    }
  }, [transcriptions]);

  useEffect(() => {
    console.log(`transcriptinsLookup waiting`)
    if (transcriptionsLookup && hasChanged(transcriptionsLookup, store.transcriptionsLookup)) {
      console.log(`transcriptinsLookup passed`)
      setTranscriptionsLookup(transcriptionsLookup);
    }
  }, [transcriptionsLookup]);

  useEffect(() => {
    console.log(`styles waiting`)
    if (styles && hasChanged(styles, store.styles)) {
      console.log(`styles passed`)
      setStyles(styles);
    }
  }, [styles]);


  useEffect(() => {
    console.log(`pitchLookup waiting`)
    if (pitchLookup && hasChanged(pitchLookup, store.pitchLookup)) {
      console.log(`pitchLookup passed`)
      setPitchLookup(pitchLookup);
    }
  }, [pitchLookup]);

  useEffect(() => {
    console.log(`wordsLookup waiting`)
    if (wordsLookup && hasChanged(wordsLookup, store.wordsLookup)) {
      console.log(`wordsLookup passed`)
      setWordsLookup(wordsLookup);
    }
  }, [wordsLookup]);

  useEffect(() => {
    console.log(`isLoading waiting`)
    if (isLoading !== store.isLoading) {
      console.log(`isLoading passed`)
      setIsLoading(isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    console.log(`loadingDuratin waiting`)
    if (totalDuration !== store.loadingDuration) {
      console.log(`loadingDuratin passed`)
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
      console.debug('Calculating loading duration:', {
        start: loadStartTimeRef.current,
        end: loadEndTime,
        elapsed,
        episodeNumber
      });
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