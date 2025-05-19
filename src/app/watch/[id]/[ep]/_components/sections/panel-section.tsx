import EpisodesListSkeleton from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list-skeleton';
import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import { AnimeEpisodeMetadata } from '@/types/anime';
import { SubtitleCue, SubtitleFile } from '@/types/subtitle';
import EpisodesList from '@/app/watch/[id]/[ep]/_components/episodes/episodes-list';

interface PanelSectionProps {
  isLoading: boolean;
  animeMetadata: AnimeEpisodeMetadata;
  subtitleFiles?: SubtitleFile[];
  japaneseTranscription?: SubtitleCue[];
}

export default function PanelSection({
  isLoading,
  animeMetadata,
  subtitleFiles,
  japaneseTranscription,
}: PanelSectionProps) {

  return (
    <div className="flex flex-col gap-5 w-full md:w-auto">
      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {(japaneseTranscription && subtitleFiles) && (
            <SubtitlePanel
              subtitleFiles={subtitleFiles}
              japaneseTranscription={japaneseTranscription}
            />
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