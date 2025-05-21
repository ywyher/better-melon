import CueNavigations from "@/app/watch/[id]/[ep]/_components/settings/cue-navigations";
import EpisodeNavigations from "@/app/watch/[id]/[ep]/_components/settings/episode-navigations";
import PlayerSettings from "@/app/watch/[id]/[ep]/_components/settings/player-settings";
import SettingsSkeleton from "@/app/watch/[id]/[ep]/_components/settings/settings-skeleton";
import { Separator } from "@/components/ui/separator";
import type { GeneralSettings, PlayerSettings as TPlayerSettings } from "@/lib/db/schema";
import { AnimeEpisodeData } from "@/types/anime";
import { SettingsForEpisode } from "@/types/settings";

interface ControlsSectionProps {
  isLoading: boolean;
  episodeData?: AnimeEpisodeData;
  episodesLength: number;
  settings: SettingsForEpisode;
}

export default function ControlsSection({
  isLoading,
  episodeData,
  episodesLength,
  settings
}: ControlsSectionProps) {
  if (isLoading) {
    return (
      <div className="w-full">
        <SettingsSkeleton />
      </div>
    );
  }

  if(!episodeData) return;

  return (
      <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
              <PlayerSettings 
                playerSettings={settings.playerSettings} 
                generalSettings={settings.generalSettings}
                animeMetadata={episodeData.metadata}
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