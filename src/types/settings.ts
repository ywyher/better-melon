import { GeneralSettings, PlayerSettings, SubtitleSettings } from "@/lib/db/schema";

export type SettingsForEpisode = {
  generalSettings: GeneralSettings;
  playerSettings: PlayerSettings;
  subtitleSettings: SubtitleSettings
}