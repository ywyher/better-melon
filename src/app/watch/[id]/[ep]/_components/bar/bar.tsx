"use client"

import DelaySlider from "@/app/watch/[id]/[ep]/_components/bar/delay-slider"
import NextCue from "@/app/watch/[id]/[ep]/_components/bar/next-cue"
import { useWatchStore } from "@/app/watch/[id]/[ep]/store"
import MultipleSelector from "@/components/multiple-selector"
import { subtitleScripts } from "@/lib/constants"
import { SubtitleScript } from "@/types/subtitle"

export default function Bar() {
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
            <NextCue />
        </div>
    )
}