'use client';

import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsMedium } from '@/lib/hooks/use-media-query';
import { useSettingsForEpisode } from '@/lib/hooks/use-settings-for-episode';
import { usePrefetchEpisode } from '@/lib/hooks/use-prefetch-episode';
import { useSubtitleTranscriptions } from '@/lib/hooks/use-subtitle-transcriptions';
import { useSubtitleStyles } from '@/lib/hooks/use-subtitle-styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEpisodeData } from '@/lib/hooks/use-episode-data';
import PlayerSection from '@/app/watch/[id]/[ep]/_components/sections/player-section';
import ControlsSection from '@/app/watch/[id]/[ep]/_components/sections/controls-section';
import PanelSection from '@/app/watch/[id]/[ep]/_components/sections/panel-section';

export default function WatchPage() {
  const params = useParams();
  const animeId = params.id as string;
  const episodeNumber = Number(params.ep as string);
  const isMedium = useIsMedium();

  const panelState = usePlayerStore((state) => state.panelState);
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);

  const loadStartTimeRef = useRef<number>(performance.now());
  const [totalDuration, setTotalDuration] = useState<number>(0);

  const {
    episodeData,
    isLoading: isEpisodeDataLoading,
    error: episodeDataError,
    loadingDuration: episodeDataLoadingDuration,
    episodesLength
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
    error: transcriptionsError,
    loadingDuration: transcriptionsLoadingDuration,
  } = useSubtitleTranscriptions();

  const { 
    styles, 
    isLoading: isStylesLoading, 
    error: stylesError,
    loadingDuration: stylesLoadingDuration 
  } = useSubtitleStyles();

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
    episodeNumber // Include episodeNumber to track when it changes
  ]);

  // Reset timers and flags when episode or anime changes
  useEffect(() => {
    console.debug('Resetting load timer for episode:', episodeNumber);
    loadStartTimeRef.current = performance.now();
    setTotalDuration(0);
    setIsVideoReady(false);
  }, [animeId, episodeNumber, setIsVideoReady]);

  usePrefetchEpisode(animeId, episodeNumber+1, episodesLength, isVideoReady);

  const errors = [episodeDataError, transcriptionsError, settingsError, stylesError].filter(Boolean);
  if (errors.length > 0) {
    return <Indicator type='error' message={errors[0]?.message || "An error occurred"} />;
  }

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
      {(!isMedium && panelState === 'visable' && episodeData?.metadata && transcriptions && transcriptions.find(t => t?.transcription == 'japanese')) && (
        <PanelSection
          isLoading={isLoading}
          animeMetadata={episodeData?.metadata}
          subtitleFiles={episodeData?.subtitles}
          japaneseTranscription={transcriptions.find(t => t?.transcription == 'japanese')!.cues}
        />
      )}
    </div>
  );
}