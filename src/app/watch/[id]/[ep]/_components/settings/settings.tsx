"use client"

import CueNavigation from "@/app/watch/[id]/[ep]/_components/settings/cue-navigation"
import DelaySlider from "@/app/watch/[id]/[ep]/_components/settings/delay-slider"
import EpisodeNavigation from "@/app/watch/[id]/[ep]/_components/settings/episode-navigator"
import ToggleButton from "@/app/watch/[id]/[ep]/_components/settings/toggle-button"
import { useMediaStore } from "@/lib/stores/media-store"
import MultipleSelector from "@/components/multiple-selector"
import { Separator } from "@/components/ui/separator"
import { subtitleTranscriptions } from "@/lib/constants"
import { SubtitleTranscription } from "@/types/subtitle"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { useCallback } from "react"
import SubtitleSettings from "@/app/watch/[id]/[ep]/_components/settings/subtitle-styles"
  
export default function Settings({ episodesLength }: { episodesLength: number }) {
    const activeTranscriptions = useMediaStore((state) => state.activeTranscriptions)
    const setActiveTranscriptions = useMediaStore((state) => state.setActiveTranscriptions)

    const autoPlay = useMediaStore((state) => state.autoPlay)
    const setAutoPlay = useMediaStore((state) => state.setAutoPlay)
    const autoNext = useMediaStore((state) => state.autoNext)
    const setAutoNext = useMediaStore((state) => state.setAutoNext)
    const autoSkip = useMediaStore((state) => state.autoSkip)
    const setAutoSkip = useMediaStore((state) => state.setAutoSkip)

    const handleTranscriptionsChange = useCallback((scripts: SubtitleTranscription[]) => {
        setActiveTranscriptions(scripts)
    }, [setActiveTranscriptions])

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
                <div className="flex flex-row gap-2">
                    <TooltipWrapper tooltip="Choose which scripts (like Romaji, Hiragana, etc.) are shown as subtitles">
                        <div className="w-full flex-1">
                            <MultipleSelector
                                placeholder="Select subtitle scripts to display"
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
                <Separator />
                <SubtitleSettings />
            </div>
        </div>
    )
}