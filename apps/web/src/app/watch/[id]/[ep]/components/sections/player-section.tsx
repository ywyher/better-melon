import GoBack from '@/components/goback';
import Player from "../player/player";
import PlayerSkeleton from "../player/player-skeleton";
import { TopControls } from '@/app/watch/[id]/[ep]/components/sections/top-controls';
import { useWatchStore } from '@/lib/stores/watch-store';
import { useEpisodeStore } from '@/lib/stores/episode-store';

interface PlayerSectionProps {
  isMedium: boolean;
}

export default function PlayerSection({
  isMedium,
}: PlayerSectionProps) {
  const isLoading = useWatchStore((state) => state.isLoading)
  const episodeData = useEpisodeStore((state) => state.episodeData)

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