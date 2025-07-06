import { GeneralSettings, PlayerSettings, SubtitleSettings, SubtitleStyles, WordSettings } from "@/lib/db/schema";

export type SettingsForEpisode = {
  generalSettings: GeneralSettings;
  playerSettings: PlayerSettings;
  subtitleSettings: SubtitleSettings
  wordSettings: WordSettings
}