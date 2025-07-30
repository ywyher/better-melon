import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
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