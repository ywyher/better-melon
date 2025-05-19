import CueNavigations from "@/app/watch/[id]/[ep]/_components/settings/cue-navigations";
import EpisodeNavigations from "@/app/watch/[id]/[ep]/_components/settings/episode-navigations";
import PlayerSettings from "@/app/watch/[id]/[ep]/_components/settings/player-settings";
import SettingsSkeleton from "@/app/watch/[id]/[ep]/_components/settings/settings-skeleton";
import { Separator } from "@/components/ui/separator";
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

  console.log(`episodeContext`, episodeContext)

  if(!episodeContext) return;

  return (
      <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
              <PlayerSettings 
                playerSettings={episodeContext.playerSettings} 
                generalSettings={episodeContext.generalSettings}
                animeMetadata={episodeContext.metadata}
              />
              <Separator />
              <div className="flex flex-row gap-2 w-full justify-between items-center">
                  <div className="flex flex-col gap-2 w-full flex-1">
                      <CueNavigations direction="previous" />
                      <CueNavigations direction="next" />
                  </div>
                  <Separator orientation="vertical" />
                  <div className="flex flex-col gap-2 w-full flex-1">
                      <EpisodeNavigations direction="previous" episodesLength={episodesLength} />
                      <EpisodeNavigations direction="next" episodesLength={episodesLength} />
                  </div>
              </div>
          </div>
      </div>
  );
}