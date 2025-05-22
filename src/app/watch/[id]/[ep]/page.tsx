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
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { getActiveSubtitleFile } from '@/lib/subtitle/utils';
import { AnimeEpisodeData, AnimeStreamingLinks } from '@/types/anime';

export default function WatchPage() {
  const params = useParams();
  const animeId = params.id as string;
  const episodeNumber = Number(params.ep as string);
  const isMedium = useIsMedium();

  const panelState = usePlayerStore((state) => state.panelState);
  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);
  const setActiveSubtitleFile = usePlayerStore((state) => state.setActiveSubtitleFile);
  const setEnglishSubtitleUrl = usePlayerStore((state) => state.setEnglishSubtitleUrl);


  const setSentence = useDefinitionStore((state) => state.setSentence);
  const setToken = useDefinitionStore((state) => state.setToken);

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

  useEffect(() => {
    if (!episodeData || !episodeData.streamingLinks || !settings || !settings.subtitleSettings) return;
    
    setActiveSubtitleFile(null);
    setEnglishSubtitleUrl(null);
    
    if (episodeData.subtitles?.length > 0) {
      const file = getActiveSubtitleFile(episodeData.subtitles, settings.subtitleSettings.preferredFormat)
      if(file) {
        setActiveSubtitleFile(file);
      }
    }
    
    if (episodeData.streamingLinks.tracks) {
      const englishSub = episodeData.streamingLinks.tracks.find(
        (s: AnimeStreamingLinks['tracks'][0]) => s.label === 'English'
      )?.file || "";
      setEnglishSubtitleUrl(englishSub);
    }
  }, [episodeData, setActiveSubtitleFile, setEnglishSubtitleUrl, settings]);

  // Reset timers and flags when episode or anime changes
  useEffect(() => {
    console.debug('Resetting load timer for episode:', episodeNumber);
    loadStartTimeRef.current = performance.now();
    setTotalDuration(0);
    setIsVideoReady(false);
    setToken(null)
    setSentence(null)
  }, [animeId, episodeNumber, setIsVideoReady]);

  usePrefetchEpisode(
    animeId, 
    episodeNumber + 1, 
    episodesLength, 
    settings?.subtitleSettings?.preferredFormat || 'srt', 
    isVideoReady
  );

  const shouldShowPanel = useMemo(() => {
    return !isMedium && 
      panelState === 'visible' && 
      episodeData?.metadata && 
      transcriptions && 
      transcriptions.find(t => t?.transcription === 'japanese')
  }, [isMedium, panelState, episodeData?.metadata, transcriptions]);

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
      {shouldShowPanel && (
        <PanelSection
          isLoading={isLoading}
          animeMetadata={episodeData?.metadata as AnimeEpisodeData['metadata']}
          subtitleFiles={episodeData?.subtitles as AnimeEpisodeData['subtitles']}
          japaneseTranscription={transcriptions.find(t => t?.transcription == 'japanese')!.cues}
        />
      )}
    </div>
  );
}