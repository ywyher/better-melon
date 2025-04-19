"use client"

import MultipleSelector from "@/components/multiple-selector"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { subtitleTranscriptions } from "@/lib/constants"
import { PlayerSettings } from "@/lib/db/schema"
import { usePlayerStore } from "@/lib/stores/player-store"
import { SubtitleTranscription } from "@/types/subtitle"
import { useCallback, useEffect } from "react"

export default function EnabledTranscriptionsSetting({ settings }: { settings: PlayerSettings }) {
    const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions)
    const setActiveTranscriptions = usePlayerStore((state) => state.setActiveTranscriptions)

    useEffect(() => {
        if (settings) {
            setActiveTranscriptions(settings.enabledTranscriptions);
        }
    }, [settings, setActiveTranscriptions]);


    const handleTranscriptionsChange = useCallback((scripts: SubtitleTranscription[]) => {
        setActiveTranscriptions(scripts)
    }, [setActiveTranscriptions])

    return (
        <TooltipWrapper tooltip="Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles">
            <div className="w-full flex-1">
                <MultipleSelector
                    placeholder="Select transcription to display"
                    options={subtitleTranscriptions.map((transcirption) => ({
                        value: transcirption,
                        label: transcirption,
                    }))}
                    value={activeTranscriptions.map((transcription) => ({
                        value: transcription,
                        label: transcription,
                    }))}
                    onChange={(transcriptions) => {
                        handleTranscriptionsChange(transcriptions.map((transcription) => transcription.value) as SubtitleTranscription[])
                    }}
                    className="w-full"
                />
            </div>
        </TooltipWrapper>
    )
}