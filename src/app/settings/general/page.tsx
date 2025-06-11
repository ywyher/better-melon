"use client"

import GeneralSettingsSkeleton from "@/app/settings/general/_components/general-settings-skeleton"
import HideSpoilers from "@/app/settings/general/_components/hide-spoilers"
import ScreenshotFormat from "@/app/settings/general/_components/screenshot-format"
import ScreenshotNamingDialog from "@/app/settings/general/_components/screenshot-naming-dialog"
import ScreenshotNamingPattern from "@/app/settings/general/_components/screenshot-naming-pattern"
import SyncPlayerSetting from "@/app/settings/general/_components/sync-player-setting"
import { Separator } from "@/components/ui/separator"
import { settingsQueries } from "@/lib/queries/settings"
import { useQuery } from "@tanstack/react-query"

export default function GeneralSettingsPage() {
    const { data: generalSettings, isLoading } = useQuery({ ...settingsQueries.general() })

    if (!generalSettings || isLoading) return <GeneralSettingsSkeleton />
  
    return (
      <div className="flex flex-col gap-5 px-4 sm:px-0">
        <div className="text-xl font-semibold">General Settings</div>
        <SyncPlayerSetting value={generalSettings.syncPlayerSettings} />
        <Separator />
        <HideSpoilers value={generalSettings.hideSpoilers} />
        <Separator />
        <ScreenshotNamingDialog value={generalSettings.screenshotNamingDialog} />
        <ScreenshotNamingPattern value={generalSettings.screenshotNamingPattern} />
        <ScreenshotFormat value={generalSettings.screenshotFormat} />
      </div>
    )
}