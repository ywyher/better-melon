'use client'

import SubtitleSettingsSkeleton from "@/app/settings/subtitle/_components/subtitle-settings-skeleton"
import MatchPattern from "@/app/settings/subtitle/_subtitle-settings/components/match-pattern"
import PreferredFormat from "@/app/settings/subtitle/_subtitle-settings/components/preferred-format"
import { Separator } from "@/components/ui/separator"
import { settingsQueries } from "@/lib/queries/settings"
import { useQuery } from "@tanstack/react-query"
  
export default function SubtitleSettings() {
    const { data: settings, isLoading: isSettingsLoading } = useQuery({ ...settingsQueries.subtitle() })

    if(isSettingsLoading || !settings) return <SubtitleSettingsSkeleton />

    return (
        <div className="flex flex-col gap-5 px-4 sm:px-0">
            <div className="text-xl font-semibold">Subtitle Settings</div>
            <PreferredFormat value={settings.preferredFormat} />
            <MatchPattern value={settings.matchPattern} />
        </div>
    )
}