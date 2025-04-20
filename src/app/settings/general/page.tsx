"use client"

import SyncPlayerSettings from "@/app/settings/general/_components/sync-player-settings"
import { getGeneralSettings } from "@/app/settings/general/actions"
import { useQuery } from "@tanstack/react-query"

export default function GeneralSettingsPage() {
    const { data: generalSettings, isLoading } = useQuery({
        queryKey: ['settings', 'general-settings'],
        queryFn: async () => await getGeneralSettings(),
    })

    if (!generalSettings || isLoading) {
        return <>Loading</>
    }
  
    return (
      <div className="flex flex-col gap-5 px-4 sm:px-0">
        <div className="text-xl font-semibold">General Settings</div>
        <SyncPlayerSettings settings={generalSettings} />
      </div>
    )
}