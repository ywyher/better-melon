import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import EpisodesListSkeleton from '../episodes/episodes-list-skeleton';
import EpisodesList from '../episodes/episodes-list';
import { Anime, AnimeEpisodeContext } from '@/types/anime';
import { SubtitleCue, SubtitleFile } from '@/types/subtitle';

interface PanelSectionProps {
  isLoading: boolean;
  animeData: Anime;
  subtitleFiles?: SubtitleFile[];
  japaneseTranscription?: SubtitleCue[];
}

export default function PanelSection({
  isLoading,
  animeData,
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