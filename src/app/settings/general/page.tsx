"use client"

import GeneralSettingsSkeleton from "@/app/settings/general/_components/general-settings-skeleton"
import SyncPlayerSetting from "@/app/settings/general/_components/sync-player-setting"
import { settingsQueries } from "@/lib/queries/settings"
import { useQuery } from "@tanstack/react-query"

export default function GeneralSettingsPage() {
    const { data: generalSettings, isLoading } = useQuery({ ...settingsQueries.general() })

    if (!generalSettings || isLoading) return <GeneralSettingsSkeleton />
  
    return (
      <div className="flex flex-col gap-5 pt-4 px-4 sm:px-0">
        <div className="text-xl font-semibold">General Settings</div>
        <SyncPlayerSetting settings={generalSettings} />
      </div>
    )
}