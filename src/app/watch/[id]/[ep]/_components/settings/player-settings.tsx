"use client"

import { getPlayerSettings } from "@/app/settings/player/actions";
import EnabledTranscriptions from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";
import PlaybackToggles from "@/app/watch/[id]/[ep]/_components/settings/playback-toggles";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { GeneralSettings, PlayerSettings as TPlayerSettings } from "@/lib/db/schema/index"
import { settingsQueries } from "@/lib/queries/settings";

type PlayerSettingsProps = {
    generalSettings: GeneralSettings
}

export default function PlayerSettings({ generalSettings }: PlayerSettingsProps) {
    const {
        data: playerSettings,
        isLoading: isPlayerSettingsLoading,
    } = useQuery({
        ...settingsQueries.player(),
        refetchOnWindowFocus: false,
    });

    if (isPlayerSettingsLoading) {
        return (
            <div className="flex flex-row gap-2">
                <Skeleton className="h-0 w-full rounded-md" />
                <div className="flex flex-row gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-2">
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