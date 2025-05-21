"use client"

import AutoNext from "@/app/settings/player/_components/auto-next"
import AutoPlay from "@/app/settings/player/_components/auto-play"
import AutoSkip from "@/app/settings/player/_components/auto-skip"
import CuePauseDuration from "@/app/settings/player/_components/cue-pause-duration"
import EnabledTranscriptionsSettings from "@/app/settings/player/_components/enabled-transcriptions-settings"
import PauseOnCue from "@/app/settings/player/_components/pause-on-cue"
import PlayerSettingsSkeleton from "@/app/settings/player/_components/player-settings-skeleton"
import { Separator } from "@/components/ui/separator"
import { settingsQueries } from "@/lib/queries/settings"
import { useQuery } from "@tanstack/react-query"

export default function PlayerSettingsPage() {
  const { data: playerSettings, isLoading } = useQuery({ ...settingsQueries.player() })
  
    if (isLoading || !playerSettings) {
      return <PlayerSettingsSkeleton />
    }
  
    return (
      <div className='pt-4'>
          <div className="flex flex-col gap-10">
            <AutoPlay value={playerSettings.autoPlay} />
            <AutoNext value={playerSettings.autoNext} />
            <AutoSkip value={playerSettings.autoSkip} />
            <Separator />
            <PauseOnCue value={playerSettings.pauseOnCue} />
            <CuePauseDuration value={playerSettings.cuePauseDuration} />
            <Separator />
            <EnabledTranscriptionsSettings playerSettings={playerSettings} />
          </div>
      </div>
    )
}