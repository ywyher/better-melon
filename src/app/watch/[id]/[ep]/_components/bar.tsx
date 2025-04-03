"use client"

import { useWatchStore } from "@/app/watch/[id]/[ep]/store"
import MultipleSelector from "@/components/multiple-selector"
import { subtitleModes } from "@/lib/constants"
import { SubtitleDisplayMode } from "@/types/subtitle"

export default function Bar() {
    const activeModes = useWatchStore((state) => state.activeModes)
    const setActiveModes = useWatchStore((state) => state.setActiveModes)

    const handleModes = (modes: SubtitleDisplayMode[]) => {
        setActiveModes(modes)
    }

    return (
        <div className="flex flex-row gap-5">
            <MultipleSelector 
                options={subtitleModes.map((mode) => {
                    return {
                        value: mode,
                        label: mode
                    }
                })}
                value={activeModes.map((mode) => {
                    return {
                        value: mode,
                        label: mode
                    }
                })}
                onChange={(modes) => handleModes(modes.map((mode) => mode.value) as SubtitleDisplayMode[])}
            />
        </div>
    )
}