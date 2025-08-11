'use client';

import Panel from '@/app/watch/[id]/[ep]/components/panel/panel';
import PlayerSection from '@/app/watch/[id]/[ep]/components/sections/player-section';
import EpisodeDetails from '@/app/watch/[id]/[ep]/components/episode/details/details';
import ControlsSection from '@/app/watch/[id]/[ep]/components/sections/controls-section';
import MissingSubtitlesDialog from '@/app/watch/[id]/[ep]/components/subtitles/missing-subtitles-dialog';
import { cn } from '@/lib/utils/utils';
import { useParams } from 'next/navigation';
import { Indicator } from '@/components/indicator';
import { useIsXLarge } from '@/lib/hooks/use-media-query';
import { useWatchData } from '@/lib/hooks/use-watch-data';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useUIStateStore } from '@/lib/stores/ui-state-store';
import { useSubtitleStore } from '@/lib/stores/subtitle-store';
import { usePrefetchEpisode } from '@/lib/hooks/use-prefetch-episode';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';
import { useLayoutEffect, useMemo } from 'react';
import { SubtitlesNotAvailableError } from '@/lib/errors/player';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    animeId,
    episodeNumber,
    loadStartTimeRef,
    setIsVideoReady,
    setActiveSubtitleFile,
    setEnglishSubtitleUrl,
    setToken,
    setSentences,
  ]);

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
        "flex flex-col gap-3 w-full col-span-14 xl:col-span-9",
        !shouldShowPanel && "xl:col-span-14"
      )}>
        {/* Top controls and player area */}
        <PlayerSection />
        {/* Episode Data Section */}
        <EpisodeDetails />
        {/* Settings below player */}
        <ControlsSection />
      </div>
      {/* Side panel (visible based on state) */}
      <div className="hidden xl:flex flex-col gap-5 col-span-5">
        {shouldShowPanel && <Panel />}
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