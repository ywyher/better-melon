"use client"

import CueNavigation from "@/app/watch/[id]/[ep]/_components/bar/cue-navigation"
import DelaySlider from "@/app/watch/[id]/[ep]/_components/bar/delay-slider"
import EpisodeNavigation from "@/app/watch/[id]/[ep]/_components/bar/episode-navigator"
import { useWatchStore } from "@/app/watch/[id]/[ep]/store"
import MultipleSelector from "@/components/multiple-selector"
import { subtitleScripts } from "@/lib/constants"
import { SubtitleScript } from "@/types/subtitle"

export default function Bar({ episodesLength }: { episodesLength: number }) {
    const activeScripts = useWatchStore((state) => state.activeScripts)
    const setActiveScripts = useWatchStore((state) => state.setActiveScripts)

    const handleScripts = (scripts: SubtitleScript[]) => {
        setActiveScripts(scripts)
    }

    return (
        <div className="flex flex-col gap-5">
            <MultipleSelector 
                options={subtitleScripts.map((script) => {
                    return {
                        value: script,
                        label: script
                    }
                })}
                value={activeScripts.map((script) => {
                    return {
                        value: script,
                        label: script
                    }
                })}
                onChange={(scripts) => handleScripts(scripts.map((script) => script.value) as SubtitleScript[])}
            />
            <DelaySlider />
            <div className="flex flex-row gap-3">
                <CueNavigation direction="previous" />
                <CueNavigation direction="next" />
            </div>
            <div className="flex flex-row gap-3">
                <EpisodeNavigation direction="previous" episodesLength={episodesLength} />
                <EpisodeNavigation direction="next" episodesLength={episodesLength} />
            </div>
        </div>
    )
}