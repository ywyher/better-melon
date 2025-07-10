"use client"

import EnabledTranscriptions from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";
import Furigana from "@/app/watch/[id]/[ep]/_components/settings/furigana";
import PlaybackToggles from "@/app/watch/[id]/[ep]/_components/settings/playback-toggles";
import Screenshot from "@/app/watch/[id]/[ep]/_components/settings/screenshot";
import type { GeneralSettings, SubtitleSettings, PlayerSettings as TPlayerSettings } from "@/lib/db/schema/index"
import { AnimeEpisodeMetadata } from "@/types/anime";

type PlayerSettingsProps = {
    generalSettings: GeneralSettings
    playerSettings: TPlayerSettings
    subtitelSettings: SubtitleSettings
    animeMetadata: AnimeEpisodeMetadata
}

export default function PlayerSettings({ 
    playerSettings, 
    generalSettings,
    subtitelSettings,
    animeMetadata
}: PlayerSettingsProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-2">
            <EnabledTranscriptions
                playerSettings={playerSettings as TPlayerSettings}
                syncPlayerSettings={generalSettings.syncPlayerSettings}
            />
            <div className="flex flex-row gap-1">
                <PlaybackToggles 
                    playerSettings={playerSettings as TPlayerSettings}
                    syncPlayerSettings={generalSettings.syncPlayerSettings}
                />
                <Furigana 
                    subtitleSettings={subtitelSettings}
                    syncPlayerSettings={generalSettings.syncPlayerSettings}
                />
                <Screenshot
                    namingPattern={generalSettings.screenshotNamingPattern}
                    namingDialog={generalSettings.screenshotNamingDialog}
                    format={generalSettings.screenshotFormat}
                    animeMetadata={animeMetadata}
                />
            </div>
        </div>
    )
}