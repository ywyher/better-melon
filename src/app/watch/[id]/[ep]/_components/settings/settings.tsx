"use client"

import CueNavigation from "@/app/watch/[id]/[ep]/_components/settings/cue-navigation"
import DelaySlider from "@/app/watch/[id]/[ep]/_components/settings/delay-slider"
import EpisodeNavigation from "@/app/watch/[id]/[ep]/_components/settings/episode-navigator"
import { Separator } from "@/components/ui/separator"
import SubtitleStyles from "@/app/watch/[id]/[ep]/_components/settings/subtitle-styles"
import PlayerSettings from "@/app/watch/[id]/[ep]/_components/settings/player-settings"
  
export default function Settings({ episodesLength }: { episodesLength: number }) {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
                <PlayerSettings />
                <Separator />
                <DelaySlider />
                <Separator />
                <div className="flex flex-row gap-2 w-full justify-between items-center">
                    <div className="flex flex-col gap-2 w-full flex-1">
                        <CueNavigation direction="previous" />
                        <CueNavigation direction="next" />
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2 w-full flex-1">
                        <EpisodeNavigation direction="previous" episodesLength={episodesLength} />
                        <EpisodeNavigation direction="next" episodesLength={episodesLength} />
                    </div>
                </div>
                <Separator />
                <SubtitleStyles />
            </div>
        </div>
    )
}