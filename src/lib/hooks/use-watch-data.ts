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
import { useEffect, useMemo, useRef, useState } from "react";

export const useWatchData = (animeId: string, episodeNumber: number) => {
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const loadStartTimeRef = useRef<number>(performance.now());
  const [totalDuration, setTotalDuration] = useState<number>(0);

  const { data: user, isLoading: isUserLoading } = useSession()

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
    activeSubtitles
  } = useActiveSubtitles(transcriptions)

  const { 
    pitchLookup,
    isLoading: isPitchAccentLoading,
    loadingDuration: pitchAccentLoadingDuration,
    error: pitchAccentError
  } = useProgressivePitchAccent(transcriptions?.find(t => t.transcription == 'japanese')?.cues || [])
  
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
      || isUserLoading
      || isWordsLoading
      || isPitchAccentLoading
    ) && !isVideoReady;
  }, [isEpisodeDataLoading, isTranscriptionsLoading, isStylesLoading, isSettingsLoading, isVideoReady]);

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
    }
  }, [
    isLoading,
    isVideoReady,
    episodeDataLoadingDuration,
    transcriptionsLoadingDuration,
    settingsLoadingDuration,
    stylesLoadingDuration,
    episodeNumber
  ]);

  return {
    user,
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
  }
};
