"use client"

import EnabledTranscriptions from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";
import PlaybackToggles from "@/app/watch/[id]/[ep]/_components/settings/playback-toggles";
import { GeneralSettings, PlayerSettings as TPlayerSettings } from "@/lib/db/schema/index"

type PlayerSettingsProps = {
    generalSettings: GeneralSettings
    playerSettings: TPlayerSettings
}

export default function PlayerSettings({ playerSettings, generalSettings }: PlayerSettingsProps) {
    return (
        <div className="flex flex-col  md:flex-row gap-2">
            <EnabledTranscriptions
                playerSettings={playerSettings as TPlayerSettings}
                syncPlayerSettings={generalSettings.syncPlayerSettings}
            />
            <PlaybackToggles 
                playerSettings={playerSettings as TPlayerSettings}
                syncPlayerSettings={generalSettings.syncPlayerSettings}
            />
        </div>
    )
}