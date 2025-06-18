import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';
import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import { AnimeEpisodeMetadata } from '@/types/anime';
import { SubtitleFile } from '@/types/subtitle';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';
import { PitchLookup, TranscriptionQuery, TranscriptionsLookup, WordsLookup } from '@/app/watch/[id]/[ep]/types';
import { useEffect } from 'react';
import { PlayerSettings, WordSettings } from '@/lib/db/schema';
import { useWatchDataStore } from '@/lib/stores/watch-store';

export default function PanelSection() {
  const isLoading = useWatchDataStore((state) => state.isLoading)
  const subtitleFiles = useWatchDataStore((state) => state.episodeData?.subtitles)
  const transcriptions = useWatchDataStore((state) => state.transcriptions)
  const transcriptionsLookup = useWatchDataStore((state) => state.transcriptionsLookup)

  return (
    <div className="flex flex-col gap-5 w-full md:w-auto">
      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {(transcriptions && subtitleFiles && transcriptionsLookup) && (
            <SubtitlePanel />
          )}
        </>
      )}
    {/*       
      {(isLoading || !animeMetadata) ? (
        <EpisodesListSkeleton />
      ) : (
        <EpisodesList
          episodesMetadata={animeMetadata} 
        />
      )} */}
    </div>
  );
}