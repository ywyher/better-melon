"use client"

import CueNavigation from "@/app/watch/[id]/[ep]/_components/settings/cue-navigation"
import DelaySlider from "@/app/watch/[id]/[ep]/_components/settings/delay-slider"
import EpisodeNavigation from "@/app/watch/[id]/[ep]/_components/settings/episode-navigator"
import ToggleButton from "@/app/watch/[id]/[ep]/_components/settings/toggle-button"
import { useWatchStore } from "@/app/watch/[id]/[ep]/store"
import MultipleSelector from "@/components/multiple-selector"
import { Separator } from "@/components/ui/separator"
import { subtitleScripts } from "@/lib/constants"
import { SubtitleScript } from "@/types/subtitle"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { useCallback } from "react"
  
export default function Settings({ episodesLength }: { episodesLength: number }) {
    const activeScripts = useWatchStore((state) => state.activeScripts)
    const setActiveScripts = useWatchStore((state) => state.setActiveScripts)

    const autoPlay = useWatchStore((state) => state.autoPlay)
    const setAutoPlay = useWatchStore((state) => state.setAutoPlay)
    const autoNext = useWatchStore((state) => state.autoNext)
    const setAutoNext = useWatchStore((state) => state.setAutoNext)
    const autoSkip = useWatchStore((state) => state.autoSkip)
    const setAutoSkip = useWatchStore((state) => state.setAutoSkip)

    const handleScripts = useCallback((scripts: SubtitleScript[]) => {
        setActiveScripts(scripts)
    }, [setActiveScripts])

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-2">
                <TooltipWrapper tooltip="Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles">
                    <div className="w-full flex-1">
                        <MultipleSelector
                            placeholder="Select subtitle scripts to display"
                            options={subtitleScripts.map((script) => ({
                                value: script,
                                label: script,
                            }))}
                            value={activeScripts.map((script) => ({
                                value: script,
                                label: script,
                            }))}
                            onChange={(scripts) => {
                                handleScripts(scripts.map((script) => script.value) as SubtitleScript[])
                            }}
                            className="w-full"
                        />
                    </div>
                </TooltipWrapper>
                <ToggleButton
                    name="Auto Play"
                    state={autoPlay}
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="w-fit"
                    tooltip={
                        <div className="text-center">
                            Auto play episode <br />
                            <span className="font-bold text-red-500">Note: player will be muted by default</span>
                        </div>
                    }
                />

                <ToggleButton
                    name="Auto Next"
                    state={autoNext}
                    onClick={() => setAutoNext(!autoNext)}
                    className="w-fit"
                    tooltip="Automatically go to the next episode after finishing"
                />

                <ToggleButton
                    name="Auto Skip"
                    state={autoSkip}
                    onClick={() => setAutoSkip(!autoSkip)}
                    className="w-fit"
                    tooltip="Automatically skip intros and outros"
                />

            </div>
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
        </div>
    )
}