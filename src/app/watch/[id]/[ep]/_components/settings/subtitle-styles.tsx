"use client"

import SubtitleStylesControls from "@/components/subtitle/subtitle-styles-controls"
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleStylesSkeleton from "@/components/subtitle/subtitle-styles-skeleton";
import { SubtitleStyles as TSubtitleStyles } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subtitleStylesSchema } from "@/app/settings/subtitle/types";
import { z } from "zod";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";

export default function SubtitleStyles() {
    const [isLoading] = useState<boolean>(false)
    const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleStyles['transcription']>('all')

    const subtitleStyles =
        useSubtitleStylesStore((state) => state.getStyles(selectedTranscription))
        || defaultSubtitleStyles
    const addStyles = useSubtitleStylesStore((state) => state.addStyles)
    const deleteStyles = useSubtitleStylesStore((state) => state.deleteStyles)

    const form = useForm<z.infer<typeof subtitleStylesSchema>>({
        resolver: zodResolver(subtitleStylesSchema),
        defaultValues: {
            transcription: selectedTranscription,
            fontSize: subtitleStyles?.fontSize,
            fontFamily: subtitleStyles?.fontFamily,
            textShadow: subtitleStyles?.textShadow,
            textColor: subtitleStyles?.textColor,
            textOpacity: subtitleStyles?.textOpacity, 
            backgroundColor: subtitleStyles?.backgroundColor, 
            backgroundOpacity: subtitleStyles?.backgroundOpacity, 
            backgroundBlur: subtitleStyles?.backgroundBlur,
            backgroundRadius: subtitleStyles?.backgroundRadius,
        }
    })

    useEffect(() => {
        if(!subtitleStyles) return;
        form.reset({
            transcription: selectedTranscription,
            fontSize: subtitleStyles.fontSize,
            fontFamily: subtitleStyles.fontFamily || "Arial",
            textShadow: subtitleStyles.textShadow || "Outline",
            textColor: subtitleStyles.textColor,
            textOpacity: subtitleStyles.textOpacity, 
            backgroundColor: subtitleStyles.backgroundColor, 
            backgroundOpacity: subtitleStyles.backgroundOpacity, 
            backgroundBlur: subtitleStyles.backgroundBlur,
            backgroundRadius: subtitleStyles.backgroundRadius,
        })
    }, [subtitleStyles])


    const onSubmit = (data: z.infer<typeof subtitleStylesSchema>) => {
        addStyles(data.transcription, data)
    }

    const handleReset = () => {
        deleteStyles(selectedTranscription)
    }

    if(!subtitleStyles) {
        return <SubtitleStylesSkeleton />
    }

    return (
        <div>
            <div className="flex flex-col gap-0 pt-4">
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                    <div className="text-lg font-semibold">Subtitle Styles</div>
                    <div className="flex flex-row gap-2">
                        <SubtitleTranscriptionSelector
                            selectedTranscription={selectedTranscription}
                            setSelectedTranscription={setSelectedTranscription}
                        />
                        {subtitleStyles && (
                            <Button
                                variant='destructive'
                                onClick={() => handleReset()}
                            >
                                <X />
                            </Button>
                        )}
                    </div>
                </div>
                <SubtitleStylesControls
                    form={form}
                    isLoading={isLoading}
                    onSubmit={(data: z.infer<typeof subtitleStylesSchema>) => onSubmit(data)}
                    method="watch"
                />
            </div>
        </div>
    )
}