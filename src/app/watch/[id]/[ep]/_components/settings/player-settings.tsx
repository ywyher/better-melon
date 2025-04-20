"use client"

import { getPlayerSettings } from "@/app/settings/player/actions";
import EnabledTranscriptionsSetting from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";
import Toggles from "@/app/watch/[id]/[ep]/_components/settings/toggles";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { GeneralSettings, PlayerSettings as TPlayerSettings } from "@/lib/db/schema/index"

type PlayerSettingsProps = {
    generalSettings: GeneralSettings
}

export default function PlayerSettings({ generalSettings }: PlayerSettingsProps) {
    const {
        data: playerSettings,
        isLoading: isPlayerSettingsLoading,
    } = useQuery({
        queryKey: ['settings', 'player-settings', 'watch'],
        queryFn: async () => await getPlayerSettings(),
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
            <EnabledTranscriptionsSetting
                playerSettings={playerSettings as TPlayerSettings}
                syncPlayerSettings={generalSettings.syncPlayerSettings}
            />
            <Toggles 
                playerSettings={playerSettings as TPlayerSettings}
                syncPlayerSettings={generalSettings.syncPlayerSettings}
            />
        </div>
    )
}