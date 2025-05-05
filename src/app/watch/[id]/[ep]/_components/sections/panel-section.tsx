import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import EpisodesListSkeleton from '../episodes/episodes-list-skeleton';
import EpisodesList from '../episodes/episodes-list';
import { Anime, AnimeEpisodeContext } from '@/types/anime';

interface PanelSectionProps {
  isLoading: boolean;
  isLoadingAnime: boolean;
  animeData: Anime;
  episodeContext?: AnimeEpisodeContext;
}

export default function PanelSection({
  isLoading,
  isLoadingAnime,
  episodeContext,
  animeData,
}: PanelSectionProps) {

  return (
    <div className="flex flex-col gap-5 w-full md:w-auto">
      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {(episodeContext && episodeContext.data.subtitles && episodeContext.japaneseTranscription) && (
            <SubtitlePanel
              subtitleFiles={episodeContext.data.subtitles}
              japaneseTranscription={episodeContext.japaneseTranscription}
            />
          )}
        </>
      )}
      
      {/*  */}
      {/* {(isLoadingAnime || !episodeContext?.metadata) ? (
        <EpisodesListSkeleton />
      ) : (
        <EpisodesList
          animeData={animeData} 
          episodesMetadata={episodeContext.metadata} 
        />
      )} */}
    </div>
  );
}