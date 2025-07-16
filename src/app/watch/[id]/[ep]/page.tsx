'use client';

import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsMedium } from '@/lib/hooks/use-media-query';
import { usePrefetchEpisode } from '@/lib/hooks/use-prefetch-episode';
import { useLayoutEffect, useMemo } from 'react';
import PlayerSection from '@/app/watch/[id]/[ep]/_components/sections/player-section';
import ControlsSection from '@/app/watch/[id]/[ep]/_components/sections/controls-section';
import PanelSection from '@/app/watch/[id]/[ep]/_components/sections/panel-section';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitlesNotAvailableError } from '@/lib/errors/player';
import MissingSubtitlesDialog from '@/app/watch/[id]/[ep]/_components/missing-subtitles-dialog';
import { useSubtitleStore } from '@/lib/stores/subtitle-store';
import { useUIStateStore } from '@/lib/stores/ui-state-store';
import { useWatchData } from '@/lib/hooks/use-watch-data';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';

export default function WatchPage() {
  const params = useParams();
  const animeId = params.id as string;
  const episodeNumber = Number(params.ep as string);
  const isMedium = useIsMedium();

  const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);
  const panelState = useUIStateStore((state) => state.panelState);
  
  const setSentences = useDefinitionStore((state) => state.setSentences);
  const setToken = useDefinitionStore((state) => state.setToken);
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);

  const {
    episode,
    errors,
    settings,
    duration,
    transcriptions,
    subtitles,
    loadStartTimeRef
  } = useWatchData(animeId, episodeNumber)

  useLayoutEffect(() => {
    loadStartTimeRef.current = performance.now();
    duration.set(0);
    setIsVideoReady(false);
    setActiveSubtitleFile(null)
    setEnglishSubtitleUrl(null)
    setToken(null)
    setSentences({
      kanji: null,
      kana: null,
      english: null,
    })
  }, [animeId, episodeNumber, setIsVideoReady]);

  usePrefetchEpisode({
    animeId,
    episodeNumber: episodeNumber + 1,
    episodeData: episode.data,
    episodesLength: episode.episodesLength,
    preferredFormat: settings?.data?.subtitleSettings.preferredFormat || defaultSubtitleSettings.preferredFormat
  });
  
  const shouldShowPanel = useMemo(() => {
    return (!isMedium && 
      panelState === 'visible' && 
      episode?.data?.metadata && 
      transcriptions && 
      transcriptions?.data?.find(t => t.transcription === 'japanese')) ? true : false
  }, [isMedium, panelState, episode?.data?.metadata, transcriptions]);

  if (errors.length > 0) {
    const subtitlesError = errors.find(error => error instanceof SubtitlesNotAvailableError);
    const error = subtitlesError || errors[0];

    if (error instanceof SubtitlesNotAvailableError) {
      return <MissingSubtitlesDialog
        animeTitle={episode?.data?.metadata.title || ""}
        episodeNumber={episode?.data?.metadata.number || 0}
        open={subtitles.errorDialog}
        onSelect={() => {
          episode.refetch();
          subtitles.reset();
        }}
        setOpen={subtitles.setErrorDialog}
        errorMessage={error.message}
      />;
    }
    return <Indicator
      type='error'
      message={error?.message || "An error occurred"}
    />;
  }

  return (
    <div className="flex flex-col md:flex-row w-full md:gap-10">
      <div className="flex flex-col gap-3 w-full">
        {/* Top controls and player area */}
        <PlayerSection isMedium={isMedium} />
        {/* Settings below player */}
        <ControlsSection />
      </div>
      {/* Side panel (visible based on state) */}
      {/* {shouldShowPanel && (
        <PanelSection />
      )} */}
    </div>
  );
}