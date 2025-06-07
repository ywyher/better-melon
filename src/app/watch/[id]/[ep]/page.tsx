'use client';

import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsMedium } from '@/lib/hooks/use-media-query';
import { useSettingsForEpisode } from '@/lib/hooks/use-settings-for-episode';
import { usePrefetchEpisode } from '@/lib/hooks/use-prefetch-episode';
import { useSubtitleTranscriptions } from '@/lib/hooks/use-subtitle-transcriptions';
import { useSubtitleStyles } from '@/lib/hooks/use-subtitle-styles';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useEpisodeData } from '@/lib/hooks/use-episode-data';
import PlayerSection from '@/app/watch/[id]/[ep]/_components/sections/player-section';
import ControlsSection from '@/app/watch/[id]/[ep]/_components/sections/controls-section';
import PanelSection from '@/app/watch/[id]/[ep]/_components/sections/panel-section';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { AnimeEpisodeData } from '@/types/anime';
import { SubtitlesNotAvailableError } from '@/lib/errors/player';
import MissingSubtitlesDialog from '@/app/watch/[id]/[ep]/_components/missing-subtitles-dialog';
import { useSetSubtitles } from '@/lib/hooks/use-set-subtitles';

export default function WatchPage() {
  const params = useParams();
  const animeId = params.id as string;
  const episodeNumber = Number(params.ep as string);
  const isMedium = useIsMedium();

  const panelState = usePlayerStore((state) => state.panelState);
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);

  const setSentences = useDefinitionStore((state) => state.setSentences);
  const setToken = useDefinitionStore((state) => state.setToken);
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const englishSubtitleUrl = usePlayerStore((state) => state.englishSubtitleUrl);

  const loadStartTimeRef = useRef<number>(performance.now());
  const [totalDuration, setTotalDuration] = useState<number>(0);

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
    transcriptionsLookup,
    isLoading: isTranscriptionsLoading, 
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
    subtitleError,
    subtitlesErrorDialog,
    setSubtitlesErrorDialog,
    resetSubtitleErrors
  } = useSetSubtitles(episodeData, settings, episodeNumber);

  const isLoading = useMemo(() => {
    return (isEpisodeDataLoading || isTranscriptionsLoading || isStylesLoading || isSettingsLoading) && !isVideoReady;
  }, [isEpisodeDataLoading, isTranscriptionsLoading, isStylesLoading, isSettingsLoading, isVideoReady]);

  useEffect(() => {
    if (!isLoading &&
      isVideoReady &&
      episodeDataLoadingDuration >= 0 &&
      transcriptionsLoadingDuration >= 0 &&
      settingsLoadingDuration >= 0 &&
      stylesLoadingDuration >= 0) {
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

  useLayoutEffect(() => {
    console.debug('Resetting load timer for episode:', episodeNumber);
    loadStartTimeRef.current = performance.now();
    setIsVideoReady(false);
    setTotalDuration(0);
    setActiveSubtitleFile(null)
    setToken(null)
    setSentences({
      kanji: null,
      kana: null,
      english: null,
    })
  }, [animeId, episodeNumber, setIsVideoReady]);

  usePrefetchEpisode(
    animeId,
    episodeNumber + 1,
    episodesLength, 
    settings?.subtitleSettings?.preferredFormat || 'srt',
    isVideoReady && episodeData?.details.nextAiringEpisode?.episode != episodeNumber + 1
  );

  const shouldShowPanel = useMemo(() => {
    return (!isMedium && 
      panelState === 'visible' && 
      episodeData?.metadata && 
      transcriptions && 
      transcriptions.find(t => t?.transcription === 'japanese')) ? true : false
  }, [isMedium, panelState, episodeData?.metadata, transcriptions]);

  const errors = useMemo(() => {
    return [
      episodeDataError,
      transcriptionsError,
      settingsError,
      stylesError,
      subtitleError
    ].filter(Boolean)
  }, [episodeDataError, transcriptionsError, settingsError, stylesError, subtitleError]);

  if (errors.length > 0) {
    const subtitlesError = errors.find(error => error instanceof SubtitlesNotAvailableError);
    const error = subtitlesError || errors[0];

    if (error instanceof SubtitlesNotAvailableError) {
      return <MissingSubtitlesDialog
        animeTitle={episodeData?.metadata.title || ""}
        episodeNumber={episodeData?.metadata.number || 0}
        open={subtitlesErrorDialog}
        onSelect={() => {
          refetchEpisodeData();
          resetSubtitleErrors();
        }}
        setOpen={setSubtitlesErrorDialog}
        errorMessage={error.message}
      />;
    }
    return <Indicator
      type='error'
      message={error?.message || "An error occurred"}
    />;
  }

  const sentences = useDefinitionStore((state) => state.sentences)

  useEffect(() => {
    console.log(`sentences`, sentences)
    console.log(`transcriptionsLookup`, transcriptionsLookup)
  }, [sentences, transcriptionsLookup])

  return (
    <div className="flex flex-col md:flex-row w-full md:gap-10">
      <div className="flex flex-col gap-3 w-full">
        {/* Top controls and player area */}
        <PlayerSection
          animeId={animeId}
          episodeNumber={episodeNumber}
          isLoading={isLoading}
          loadingDuration={totalDuration}
          episodeData={episodeData}
          episodesLength={episodesLength}
          isMedium={isMedium}
          transcriptions={transcriptions}
          transcriptionsStyles={styles}
          settings={settings}
          transcriptionsLookup={transcriptionsLookup}
        />
        {/* Settings below player */}
        <ControlsSection
          isLoading={isLoading}
          episodeData={episodeData}
          episodesLength={episodesLength}
          settings={settings}
        />
      </div>
      {/* Side panel (visible based on state) */}
      {shouldShowPanel && (
        <PanelSection
          isLoading={isLoading}
          animeMetadata={episodeData?.metadata as AnimeEpisodeData['metadata']}
          subtitleFiles={episodeData?.subtitles as AnimeEpisodeData['subtitles']}
          transcriptions={transcriptions}
          transcriptionsLookup={transcriptionsLookup}
        />
      )}
    </div>
  );
}