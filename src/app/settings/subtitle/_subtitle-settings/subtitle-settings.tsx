'use client'

import SubtitleSettingsSkeleton from "@/app/settings/subtitle/_components/subtitle-settings-skeleton"
import { getSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions"
import SubtitleSettingsMatchPattern from "@/app/settings/subtitle/_subtitle-settings/components/match-pattern"
import SubtitleSettingsPreferredFormat from "@/app/settings/subtitle/_subtitle-settings/components/preferred-format"
import { SubtitleSettings as TSubtitleSettings } from "@/lib/db/schema"
import { useQuery } from "@tanstack/react-query"
  
export default function SubtitleSettings() {
    const { data: settings, isLoading: isSettingsLoading } = useQuery({
        queryKey: ['settings', 'subtitle-settings'],
        queryFn: async () => {
            return await getSubtitleSettings() as TSubtitleSettings
        }
    })

    if(isSettingsLoading) return <SubtitleSettingsSkeleton />

    return (
        <div className="flex flex-col gap-5">
            <div className="text-xl font-semibold">Subtitle Settings</div>
            <SubtitleSettingsPreferredFormat 
                settingsId={settings?.id ?? ""}
                preferredFormat={settings?.preferredFormat ?? null}
            />
            <SubtitleSettingsMatchPattern 
                settingsId={settings?.id ?? ""}
                matchPattern={settings?.matchPattern ?? ""}
            />
        </div>
    )
}