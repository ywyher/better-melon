import { useStreamingStore } from '@/lib/stores/streaming-store';
import SubtitlePanel from '../panel/panel';
import PanelSkeleton from '../panel/panel-skeleton';

export default function PanelSection() {
  const isLoading = useStreamingStore((state) => state.isLoading)

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