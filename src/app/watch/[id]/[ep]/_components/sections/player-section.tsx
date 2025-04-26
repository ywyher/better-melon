// _components/layout/PlayerSection.tsx
import { useState } from 'react';
import GoBack from '@/components/goback';
import Player from "../player/player";
import PlayerSkeleton from "../player/player-skeleton";
import { usePlayerStore } from '@/lib/stores/player-store';
import { TopControls } from '@/app/watch/[id]/[ep]/_components/sections/top-controls';
import { AnimeEpisodeContext } from '@/types/anime';

interface PlayerSectionProps {
  animeId: string;
  episodeNumber: number;
  isLoading: boolean;
  loadingDuration: number;
  currentEpisode: any;
  data?: AnimeEpisodeContext;
  episodesLength: number;
  isMedium: boolean;
}

export default function PlayerSection({
  animeId,
  episodeNumber,
  isLoading,
  loadingDuration,
  currentEpisode,
  data,
  episodesLength,
  isMedium,
}: PlayerSectionProps) {
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const panelState = usePlayerStore((state) => state.panelState);
  const setPanelState = usePlayerStore((state) => state.setPanelState);

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <GoBack />
        <TopControls 
          isLoading={isLoading}
          loadingDuration={loadingDuration}
          data={data}
          isMedium={isMedium}
          panelState={panelState}
          setPanelState={setPanelState}
        />
      </div>
      
      <div className="relative w-full lg:aspect-video">
        {isLoading ? (
          <PlayerSkeleton isLoading={true} />
        ) : (
          <>
            {data && (
              <Player 
                animeId={animeId}
                episodeNumber={episodeNumber}
                isVideoReady={isVideoReady}
                setIsVideoReady={setIsVideoReady}
                episode={currentEpisode} 
                streamingData={data?.episodeStreamingData} 
                episodesLength={episodesLength}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}