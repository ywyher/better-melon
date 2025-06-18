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
import { AnimeEpisodeData } from '@/types/anime';
import { SubtitlesNotAvailableError } from '@/lib/errors/player';
import MissingSubtitlesDialog from '@/app/watch/[id]/[ep]/_components/missing-subtitles-dialog';
import { useSubtitleStore } from '@/lib/stores/subtitle-store';
import { useUIStateStore } from '@/lib/stores/ui-state-store';
import { useWatchData } from '@/lib/hooks/use-watch-data';

export default function WatchPage() {
  const params = useParams();
  const animeId = params.id as string;
  const episodeNumber = Number(params.ep as string);
  const isMedium = useIsMedium();

  const isVideoReady = usePlayerStore((state) => state.isVideoReady);
  const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);
  const panelState = useUIStateStore((state) => state.panelState);
  
  const setSentences = useDefinitionStore((state) => state.setSentences);
  const setToken = useDefinitionStore((state) => state.setToken);
  const setActiveSubtitleFile = useSubtitleStore((state) => state.setActiveSubtitleFile);
  const setEnglishSubtitleUrl = useSubtitleStore((state) => state.setEnglishSubtitleUrl);

  const {
    episode,
    errors,
    isLoading,
    pitchAccent,
    settings,
    styles,
    duration,
    transcriptions,
    words,
    subtitles
  } = useWatchData(animeId, episodeNumber)

  useLayoutEffect(() => {
    console.debug('Resetting load timer for episode:', episodeNumber);
    // loadStartTimeRef.current = performance.now();
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

  const shouldPrefetch = useMemo(() => {
    if(episode?.data?.details.nextAiringEpisode) {
      return isVideoReady && episode?.data?.details.nextAiringEpisode?.episode != episodeNumber + 1
    }else {
      return isVideoReady && episode?.data?.details.episodes != episodeNumber
    };
  }, [isVideoReady, episode?.data])

  usePrefetchEpisode(
    animeId,
    episodeNumber + 1,
    episode.episodesLength, 
    settings?.data.subtitleSettings.preferredFormat || 'srt',
    shouldPrefetch
  );

  const shouldShowPanel = useMemo(() => {
    return (!isMedium && 
      panelState === 'visible' && 
      episode?.data?.metadata && 
      transcriptions && 
      transcriptions.data.find(t => t.transcription === 'japanese')) ? true : false
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
        <PlayerSection
          animeId={animeId}
          episodeNumber={episodeNumber}
          isLoading={isLoading}
          loadingDuration={duration.total}
          episodeData={episode.data}
          episodesLength={episode.episodesLength}
          isMedium={isMedium}
          transcriptions={transcriptions.data}
          transcriptionsStyles={styles.data}
          settings={settings.data}
          transcriptionsLookup={transcriptions.lookup}
          pitchLookup={pitchAccent.lookup}
          wordsLookup={words.lookup}
          activeSubtitles={subtitles.active}
        />
        {/* Settings below player */}
        <ControlsSection
          isLoading={isLoading}
          episodeData={episode.data}
          episodesLength={episode.episodesLength}
          settings={settings.data}
        />
      </div>
      {/* Side panel (visible based on state) */}
      {shouldShowPanel && (
        <PanelSection
          isLoading={isLoading}
          animeMetadata={episode?.data?.metadata as AnimeEpisodeData['metadata']}
          subtitleFiles={episode?.data?.subtitles as AnimeEpisodeData['subtitles']}
          transcriptions={transcriptions.data}
          transcriptionsLookup={transcriptions.lookup}
          autoScrollToCue={settings.data.playerSettings.autoScrollToCue}
          autoScrollResumeDelay={settings.data.playerSettings.autoScrollResumeDelay}
          pitchLookup={pitchAccent.lookup}
          wordsLookup={words.lookup}
          learningStatus={settings.data.wordSettings.learningStatus}
          pitchColoring={settings.data.wordSettings.pitchColoring}
        />
      )}
    </div>
  );
}