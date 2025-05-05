import Settings from "@/app/watch/[id]/[ep]/_components/settings/settings";
import SettingsSkeleton from "@/app/watch/[id]/[ep]/_components/settings/settings-skeleton";
import { AnimeEpisodeContext } from "@/types/anime";

interface ControlsSectionProps {
  isLoading: boolean;
  episodeContext?: AnimeEpisodeContext;
  episodesLength: number;
}

export default function ControlsSection({
  isLoading,
  episodeContext,
  episodesLength
}: ControlsSectionProps) {
  if (isLoading) {
    return (
      <div className="w-full">
        <SettingsSkeleton />
      </div>
    );
  }

  if(!episodeContext) return;

  return (
    <div className='flex flex-col gap-3 w-full'>
      <Settings 
        playerSettings={episodeContext.playerSettings}
        generalSettings={episodeContext.generalSettings} 
        episodesLength={episodesLength} 
      />
    </div>
  );
}