"use client"

import AutoPlaybackSettings from "@/app/settings/player/_components/auto-playback-settings"
import EnabledTranscriptionsSettings from "@/app/settings/player/_components/enabled-transcriptions-settings"
import PlayerSettingsSkeleton from "@/app/settings/player/_components/player-settings-skeleton"
import { Separator } from "@/components/ui/separator"
import { PlayerSettings as TPlayerSettings } from "@/lib/db/schema"
import { settingsQueries } from "@/lib/queries/settings"
import { useQuery } from "@tanstack/react-query"

export default function PlayerSettingsPage() {
  const { data: playerSettings, isLoading } = useQuery({ ...settingsQueries.player() })
  
    if (isLoading) {
      return <PlayerSettingsSkeleton />
    }
  
    return (
      <div className='pt-4'>
          <div className="flex flex-col gap-10">
            <AutoPlaybackSettings playerSettings={playerSettings as TPlayerSettings} />
            <Separator />
            <EnabledTranscriptionsSettings playerSettings={playerSettings as TPlayerSettings} />
          </div>
      </div>
    )
}