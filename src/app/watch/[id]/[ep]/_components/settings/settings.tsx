"use client"

import CueNavigations from "@/app/watch/[id]/[ep]/_components/settings/cue-navigations"
import DelayController from "@/app/watch/[id]/[ep]/_components/settings/delay-controller"
import EpisodeNavigations from "@/app/watch/[id]/[ep]/_components/settings/episode-navigations"
import { Separator } from "@/components/ui/separator"
import SubtitleStyles from "@/app/watch/[id]/[ep]/_components/settings/subtitle-styles"
import PlayerSettings from "@/app/watch/[id]/[ep]/_components/settings/player-settings"
import { useQuery } from "@tanstack/react-query"
import { getGeneralSettings } from "@/app/settings/general/actions"
import SettingsSkeleton from "@/app/watch/[id]/[ep]/_components/settings/settings-skeleton"
import { settingsQueries } from "@/lib/queries/settings"
  
export default function Settings({ episodesLength }: { episodesLength: number }) {
    const { data: generalSettings, isLoading: isGeneralSettingsLoading } = useQuery({
        ...settingsQueries.general(),
        refetchOnWindowFocus: false,
    })

    if(!generalSettings || isGeneralSettingsLoading) return <SettingsSkeleton />

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
                <PlayerSettings generalSettings={generalSettings} />
                <Separator />
                <DelayController />
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
                <Separator />
                <SubtitleStyles
                    syncPlayerSettings={generalSettings.syncPlayerSettings}
                />
            </div>
        </div>
    )
}