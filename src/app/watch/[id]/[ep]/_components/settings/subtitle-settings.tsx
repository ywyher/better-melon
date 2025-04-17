"use client"

import { getGlobalSubtitleSettings } from "@/app/settings/subtitle/actions";
import SubtitleSettingsControls from "@/components/subtitle/subtitle-settings-controls"
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleSettingsSkeleton from "@/components/subtitle/subtitle-settings-skeleton";
import { SubtitleSettings as TSubtitleSettings } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subtitleSettingsSchema } from "@/app/settings/subtitle/types";
import { z } from "zod";
import { useSubtitleSettingsStore } from "@/lib/stores/subtitle-settings-store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { defaultSubtitleSettings } from "@/app/settings/subtitle/constants";

export default function SubtitleSettings() {
    const [isLoading] = useState<boolean>(false)
    const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleSettings['transcription']>('all')

    const subtitleSettings = 
        useSubtitleSettingsStore((state) => state.getSettings(selectedTranscription))
        || defaultSubtitleSettings
    const addSettings = useSubtitleSettingsStore((state) => state.addSettings)
    const deleteSettings = useSubtitleSettingsStore((state) => state.deleteSettings)

    const form = useForm<z.infer<typeof subtitleSettingsSchema>>({
        resolver: zodResolver(subtitleSettingsSchema),
        defaultValues: {
            transcription: selectedTranscription,
            fontSize: subtitleSettings?.fontSize,
            fontFamily: subtitleSettings?.fontFamily,
            textShadow: subtitleSettings?.textShadow,
            textColor: subtitleSettings?.textColor,
            textOpacity: subtitleSettings?.textOpacity, 
            backgroundColor: subtitleSettings?.backgroundColor, 
            backgroundOpacity: subtitleSettings?.backgroundOpacity, 
            backgroundBlur: subtitleSettings?.backgroundBlur,
            backgroundRadius: subtitleSettings?.backgroundRadius,
        }
    })

    useEffect(() => {
        if(!subtitleSettings) return;
        form.reset({
            transcription: selectedTranscription,
            fontSize: subtitleSettings.fontSize,
            fontFamily: subtitleSettings.fontFamily || "Arial",
            textShadow: subtitleSettings.textShadow || "Outline",
            textColor: subtitleSettings.textColor,
            textOpacity: subtitleSettings.textOpacity, 
            backgroundColor: subtitleSettings.backgroundColor, 
            backgroundOpacity: subtitleSettings.backgroundOpacity, 
            backgroundBlur: subtitleSettings.backgroundBlur,
            backgroundRadius: subtitleSettings.backgroundRadius,
        })
    }, [subtitleSettings])


    const onSubmit = (data: z.infer<typeof subtitleSettingsSchema>) => {
        addSettings(data.transcription, data)
    }

    const handleReset = () => {
        deleteSettings(selectedTranscription)
    }

    if(!subtitleSettings) {
        return <SubtitleSettingsSkeleton />
    }

    return (
        <div>
            <div className="flex flex-col gap-0 pt-4">
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                    <div className="text-xl font-semibold">Subtitle Settings</div>
                    <div className="flex flex-row gap-2">
                        <SubtitleTranscriptionSelector
                            selectedTranscription={selectedTranscription}
                            setSelectedTranscription={setSelectedTranscription}
                        />
                        {subtitleSettings && (
                            <Button
                                variant='destructive'
                                onClick={() => handleReset()}
                            >
                                <X />
                            </Button>
                        )}
                    </div>
                </div>
                <SubtitleSettingsControls
                    form={form}
                    isLoading={isLoading}
                    onSubmit={(data: z.infer<typeof subtitleSettingsSchema>) => onSubmit(data)}
                    method="watch"
                />
            </div>
        </div>
    )
}