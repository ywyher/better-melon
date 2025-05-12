'use client';
import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsMedium } from '@/lib/hooks/use-media-query';
import { useEpisodeData } from '@/lib/hooks/use-epsiode-data';
import PlayerSection from '@/app/watch/[id]/[ep]/_components/sections/player-section';
import ControlsSection from '@/app/watch/[id]/[ep]/_components/sections/controls-section';
import PanelSection from '@/app/watch/[id]/[ep]/_components/sections/panel-section';
import { usePrefetchNextEpisode } from '@/lib/hooks/use-prefetch-next-episode';
import { useSubtitleTranscriptions } from '@/lib/hooks/use-subtitle-transcriptions';
import { useSubtitleStyles } from '@/lib/hooks/use-subtitle-styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearSubtitleCache } from '@/lib/subtitle/parse';
import { ActiveSubtitleFile } from '@/types/subtitle';

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
    episodeContext,
    isLoading: isEpisodeContextLoading,
    error: dataError,
    loadingDuration: episodeContextLoadingDuration,
    episodesLength
  } = useEpisodeData(animeId, episodeNumber);
  
  const { 
    transcriptions, 
    isLoading: isTranscriptionsLoading, 
    loadingDuration: transcriptionsLoadingDuration 
  } = useSubtitleTranscriptions();
  
  const { 
    styles, 
    isLoading: isStylesLoading, 
    loadingDuration: stylesLoadingDuration 
  } = useSubtitleStyles();

  const isLoading = useMemo(() => {
    return (isEpisodeContextLoading || isTranscriptionsLoading || isStylesLoading) && !isVideoReady
  }, [isEpisodeContextLoading, isTranscriptionsLoading, isStylesLoading, isVideoReady]);

  useEffect(() => {
    if (!isLoading && isVideoReady && episodeContextLoadingDuration && transcriptionsLoadingDuration && stylesLoadingDuration) {
      const loadEndTime = performance.now();
      const elapsed = loadEndTime - loadStartTimeRef.current;
      setTotalDuration(elapsed);
    }
  }, [isLoading, episodeContextLoadingDuration, transcriptionsLoadingDuration, stylesLoadingDuration, isVideoReady]);

  useEffect(() => {
    if (isLoading) {
      loadStartTimeRef.current = performance.now();
      setTotalDuration(0);
    }
    // clearSubtitleCache(activeSubtitleFile?.source)
    setIsVideoReady(false)
  }, [animeId, episodeNumber]); // Reset timer on page navigation

  usePrefetchNextEpisode(animeId, episodeNumber, episodesLength, isVideoReady);

  const errors = [dataError].filter(Boolean);
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
          episodeContext={episodeContext}
          episodesLength={episodesLength}
          isMedium={isMedium}
          transcriptions={transcriptions}
          transcriptionsStyles={styles}
        />
        {/* Settings below player */}
        <ControlsSection
          isLoading={isLoading}
          episodeContext={episodeContext}
          episodesLength={episodesLength}
        />
      </div>
      {/* Side panel (visible based on state) */}
      {(!isMedium && panelState === 'visable' && episodeContext?.data.details && transcriptions && transcriptions.find(t => t?.transcription == 'japanese')) && (
        <PanelSection
          isLoading={isLoading}
          animeData={episodeContext?.data.details}
          subtitleFiles={episodeContext?.data.subtitles}
          japaneseTranscription={transcriptions.find(t => t?.transcription == 'japanese')!.cues}
        />
      )}
    </div>
  );
}