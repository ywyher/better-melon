"use client"

import CueNavigations from "@/app/watch/[id]/[ep]/_components/settings/cue-navigations"
import EpisodeNavigations from "@/app/watch/[id]/[ep]/_components/settings/episode-navigations"
import { Separator } from "@/components/ui/separator"
import type { GeneralSettings, PlayerSettings as TPlayerSettings } from "@/lib/db/schema"
import PlayerSettings from "@/app/watch/[id]/[ep]/_components/settings/player-settings"
  
export default function Settings({ generalSettings, episodesLength, playerSettings }: 
  { 
    episodesLength: number
    generalSettings: GeneralSettings
    playerSettings: TPlayerSettings
  }) {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
                <PlayerSettings playerSettings={playerSettings} generalSettings={generalSettings} />
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
            </div>
        </div>
    )
}