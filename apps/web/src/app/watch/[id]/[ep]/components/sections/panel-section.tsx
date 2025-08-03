import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';
import { useWatchStore } from '@/lib/stores/watch-store';

export default function PanelSection() {
  const isLoading = useWatchStore((state) => state.isLoading)

  return (
    <div className="flex flex-col gap-5 w-full xl:w-auto">
      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <SubtitlePanel />
      )}
    </div>
  );
}