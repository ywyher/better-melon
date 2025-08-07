'use client';

import PlayerSection from '@/app/watch/[id]/[ep]/components/sections/player-section';
import MissingSubtitlesDialog from '@/app/watch/[id]/[ep]/components/subtitles/missing-subtitles-dialog';
import ControlsSection from '@/app/watch/[id]/[ep]/components/sections/controls-section';
import EpisodesList from '@/components/episodes-list/episodes-list';
import PanelSkeleton from '@/app/watch/[id]/[ep]/components/panel/panel-skeleton';
import SubtitlePanel from '@/app/watch/[id]/[ep]/components/panel/panel';
import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useIsXLarge } from '@/lib/hooks/use-media-query';
import { usePrefetchEpisode } from '@/lib/hooks/use-prefetch-episode';
import { useLayoutEffect, useMemo } from 'react';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitlesNotAvailableError } from '@/lib/errors/player';
import { useSubtitleStore } from '@/lib/stores/subtitle-store';
import { useUIStateStore } from '@/lib/stores/ui-state-store';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';
import { useSaveProgress } from '@/lib/hooks/use-save-progress';
import { cn } from '@/lib/utils/utils';
import { useWatchData } from '@/lib/hooks/use-watch-data';
import EpisodeDetails from '@/app/watch/[id]/[ep]/components/episode/details/details';

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
    streaming,
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
    streamingData: streaming.data || null,
    preferredFormat: settings?.data?.subtitleSettings.preferredFormat || defaultSubtitleSettings.preferredFormat
  });
  
  // CAUSES LAGGGGG FUCKK
  // useSaveProgress({
  //   animeId,
  //   episodeNumber,
  //   animeCoverImage: streaming.data?.anime.coverImage,
  //   animeTitle: streaming.data?.anime.title,
  // })
  
  const shouldShowPanel = useMemo(() => {
    return (isXLarge && 
      panelState === 'visible' && 
      transcriptions && 
      transcriptions?.data?.find(t => t.transcription === 'japanese')) ? true : false
  }, [isXLarge, panelState, transcriptions]);

  if (errors.length > 0 && streaming.data) {
    const subtitlesError = errors.find(error => error instanceof SubtitlesNotAvailableError);
    const error = subtitlesError || errors[0];

    if (error instanceof SubtitlesNotAvailableError) {
      return <MissingSubtitlesDialog
        animeTitle={streaming.data.anime.title}
        episodeNumber={episodeNumber}
        open={subtitles.errorDialog}
        onSelect={() => {
          streaming.refetch();
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
        {/* Episode Data Section */}
        <EpisodeDetails />
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
           <SubtitlePanel />
          </>
        )}
        {/* {isLoading ? (
          <EpisodesList 
            nextAiringEpisode={streaming.data?.anime.nextAiringEpisode}
            animeTitle={streaming.data?.anime.title}
            animeBanner={streaming.data?.anime.bannerImage}
            isLoading={isLoading}
          />
        ): (
          <>
            {shouldShowPanel && (
              <EpisodesList 
                nextAiringEpisode={streaming.data?.anime.nextAiringEpisode}
                animeTitle={streaming.data?.anime.title}
                animeBanner={streaming.data?.anime.bannerImage}
              />
            )}
          </>
        )} */}
      </div>
    </div>
  );
}