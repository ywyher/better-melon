"use client"

import { getPlayerSettings } from "@/app/settings/player/actions";
import EnabledTranscriptionsSetting from "@/app/watch/[id]/[ep]/_components/settings/enabled-transcriptions";
import Toggles from "@/app/watch/[id]/[ep]/_components/settings/toggles";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { PlayerSettings as TPlayerSettings } from "@/lib/db/schema/index"

export default function PlayerSettings() {
    const {
        data: settings,
        isLoading,
    } = useQuery({
        queryKey: ['settings', 'player-settings'],
        queryFn: async () => await getPlayerSettings(),
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
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
            <EnabledTranscriptionsSetting settings={settings as TPlayerSettings} />
            <Toggles settings={settings as TPlayerSettings} />
        </div>
    )
}