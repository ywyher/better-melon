import GoBack from '@/components/goback';
import Player from "../player/player";
import PlayerSkeleton from "../player/player-skeleton";
import { TopControls } from '@/app/watch/[id]/[ep]/components/sections/top-controls';
import { useStreamingStore } from '@/lib/stores/streaming-store';

export default function PlayerSection() {
  const isLoading = useStreamingStore((state) => state.isLoading)

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <GoBack />
        <TopControls />
      </div>
      
      <div className="relative w-full lg:aspect-video">
        {isLoading ? (
          <PlayerSkeleton isLoading={isLoading} />
        ) : ( <Player /> )}
      </div>
    </>
  );
}