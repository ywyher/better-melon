'use client';

import PlayerSection from '@/app/watch/[id]/[ep]/components/sections/player-section';
import MissingSubtitlesDialog from '@/app/watch/[id]/[ep]/components/subtitles/missing-subtitles-dialog';
import ControlsSection from '@/app/watch/[id]/[ep]/components/sections/controls-section';
import PanelSection from '@/app/watch/[id]/[ep]/components/sections/panel-section';
import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsXLarge } from '@/lib/hooks/use-media-query';
import { usePrefetchEpisode } from '@/lib/hooks/use-prefetch-episode';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitlesNotAvailableError } from '@/lib/errors/player';
import { useSubtitleStore } from '@/lib/stores/subtitle-store';
import { useUIStateStore } from '@/lib/stores/ui-state-store';
import { useWatchData } from '@/lib/hooks/use-watch-data';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';
import { useSaveProgress } from '@/lib/hooks/use-save-progress';
import EpisodesList from '@/components/episodes-list/episodes-list';
import PanelSkeleton from '@/app/watch/[id]/[ep]/components/panel/panel-skeleton';
import SubtitlePanel from '@/app/watch/[id]/[ep]/components/panel/panel';
import { cn } from '@/lib/utils/utils';

export default function WatchPage() {
  const params = useParams();
  const animeId = Number(params.id);
  const episodeNumber = Number(params.ep as string);
  const isXLarge = useIsXLarge();

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
    loadStartTimeRef,
    isLoading
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
    episodeData: episode.data || null,
    episodesLength: episode.episodesLength,
    preferredFormat: settings?.data?.subtitleSettings.preferredFormat || defaultSubtitleSettings.preferredFormat
  });
  
  useSaveProgress({
    animeId,
    episodeNumber,
    animeCoverImage: episode.data?.details.coverImage,
    animeTitle: episode.data?.details.title,
  })
  
  const shouldShowPanel = useMemo(() => {
    return (isXLarge && 
      panelState === 'visible' && 
      episode?.data?.metadata && 
      transcriptions && 
      transcriptions?.data?.find(t => t.transcription === 'japanese')) ? true : false
  }, [isXLarge, panelState, episode?.data?.metadata, transcriptions]);

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
    <div className="grid grid-cols-14 gap-8 pb-20">
      <div className={cn(
        "flex flex-col gap-3 w-full",
        (isLoading || shouldShowPanel) && 'col-span-9',
        (!shouldShowPanel) && 'col-span-14',
      )}>
        {/* Top controls and player area */}
        <PlayerSection />
        {/* Settings below player */}
        <ControlsSection />
      </div>
      {/* Side panel (visible based on state) */}
      <div className={cn(
        "flex flex-col gap-5",
        (isLoading || shouldShowPanel) && 'col-span-5'
      )}>
        {isLoading ? (
          <PanelSkeleton />
        ) : (
          <>
            {shouldShowPanel && <SubtitlePanel />}
          </>
        )}
        {isLoading ? (
          <EpisodesList 
            nextAiringEpisode={episode.data?.details.nextAiringEpisode}
            animeTitle={episode.data?.details.title}
            animeBanner={episode.data?.details.bannerImage}
            isLoading={isLoading}
          />
        ): (
          <>
            {shouldShowPanel && (
              <EpisodesList 
                nextAiringEpisode={episode.data?.details.nextAiringEpisode}
                animeTitle={episode.data?.details.title}
                animeBanner={episode.data?.details.bannerImage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}