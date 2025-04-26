import Settings from "@/app/watch/[id]/[ep]/_components/settings/settings";
import SettingsSkeleton from "@/app/watch/[id]/[ep]/_components/settings/settings-skeleton";
import { AnimeEpisodeContext } from "@/types/anime";

interface ControlsSectionProps {
  isLoading: boolean;
  data?: AnimeEpisodeContext;
  episodesLength: number;
}

export default function ControlsSection({
  isLoading,
  data,
  episodesLength
}: ControlsSectionProps) {
  if (isLoading) {
    return (
      <div className="w-full">
        <SettingsSkeleton />
      </div>
    );
  }

  if(!data) return;

  return (
    <div className='flex flex-col gap-3 w-full'>
      <Settings 
        playerSettings={data.playerSettings}
        generalSettings={data.generalSettings} 
        episodesLength={episodesLength} 
      />
    </div>
  );
}