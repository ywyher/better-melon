import { useTranscriptionStore } from '@/lib/stores/transcription-store';
import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import { useWatchStore } from '@/lib/stores/watch-store';
import { useEpisodeStore } from '@/lib/stores/episode-store';

export default function PanelSection() {
  const isLoading = useWatchStore((state) => state.isLoading)
  const subtitleFiles = useEpisodeStore((state) => state.episodeData?.subtitles)
  const transcriptions = useTranscriptionStore((state) => state.transcriptions)
  const transcriptionsLookup = useTranscriptionStore((state) => state.transcriptionsLookup)

  return (
    <div className="flex flex-col gap-5 w-full xl:w-auto">
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