import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import EpisodesListSkeleton from '../episodes/episodes-list-skeleton';
import EpisodesList from '../episodes/episodes-list';
import { Anime, AnimeEpisodeContext } from '@/types/anime';

interface PanelSectionProps {
  isLoading: boolean;
  isLoadingAnime: boolean;
  animeData: Anime;
  data?: AnimeEpisodeContext;
}

export default function PanelSection({
  isLoading,
  isLoadingAnime,
  data,
  animeData,
}: PanelSectionProps) {

  return (
    <div className="flex flex-col gap-5 w-full md:w-auto">
      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {(data?.subtitleFiles && data?.japaneseTranscription) && (
            <SubtitlePanel
              subtitleFiles={data.subtitleFiles}
              japaneseTranscription={data.japaneseTranscription}
            />
          )}
        </>
      )}
      
      {(isLoadingAnime || !data?.episodesMetadata) ? (
        <EpisodesListSkeleton />
      ) : (
        <EpisodesList
          animeData={animeData} 
          episodesMetadata={data.episodesMetadata} 
        />
      )}
    </div>
  );
}