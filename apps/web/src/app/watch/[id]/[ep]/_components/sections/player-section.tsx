import GoBack from '@/components/goback';
import Player from "../player/player";
import PlayerSkeleton from "../player/player-skeleton";
import { TopControls } from '@/app/watch/[id]/[ep]/_components/sections/top-controls';
import { useWatchDataStore } from '@/lib/stores/watch-store';
import { useEffect } from 'react';

interface PlayerSectionProps {
  isMedium: boolean;
}

export default function PlayerSection({
  isMedium,
}: PlayerSectionProps) {
  const isLoading = useWatchDataStore((state) => state.isLoading)
  const episodeData = useWatchDataStore((state) => state.episodeData)

  useEffect(() => {
    console.log(`player isLoading`, isLoading)
  }, [isLoading])

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <GoBack />
        <TopControls isMedium={isMedium} />
      </div>
      
      <div className="relative w-full lg:aspect-video">
        {isLoading ? (
          <PlayerSkeleton isLoading={isLoading} />
        ) : (
          <>
            {episodeData && (
              <>
                <Player />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}