"use client"

import SubtitleStylesControls from "@/components/subtitle/subtitle-styles-controls"
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleStylesSkeleton from "@/components/subtitle/subtitle-styles-skeleton";
import { GeneralSettings, SubtitleStyles as TSubtitleStyles } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subtitleStylesSchema } from "@/app/settings/subtitle/types";
import { z } from "zod";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createSubtitleStyles, updateSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/actions";
import { settingsQueries } from "@/lib/queries/settings";

type SubtitleStylesProps = {
    syncPlayerSettings: GeneralSettings['syncPlayerSettings']
}

// Note: subtitle styles are being fetched and set in the store via
// /watch/[id]/[ep]/_components/transcriptions/transcriptions.tsx
export default function SubtitleStyles({ syncPlayerSettings }: SubtitleStylesProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleStyles['transcription']>('all')

    const queryClient = useQueryClient()

    const styles = useSubtitleStylesStore((state) => state.styles)
    const subtitleStyles =
        useSubtitleStylesStore((state) => state.getStyles(selectedTranscription))
        || defaultSubtitleStyles
    const updateStyles = useSubtitleStylesStore((state) => state.updateStyles)
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
    }, [subtitleStyles, form, selectedTranscription])

    const onSubmit = async (data: z.infer<typeof subtitleStylesSchema>) => {
        updateStyles(data.transcription, {
            ...data
        })

        let syncStrategy = syncPlayerSettings;
        
        if (syncStrategy === 'ask') {
            const { strategy, error } = await showSyncSettingsToast();
            
            if (error) {
                toast.error(error);
                updateStyles(data.transcription, subtitleStyles)
                return;
            }
            if (!strategy) return;
            
            syncStrategy = strategy;
        }

        if (syncStrategy === 'always' || syncStrategy === 'ask') {
            try {
                let result;
                setIsLoading(true);
                
                if(subtitleStyles?.id && (selectedTranscription == subtitleStyles.transcription)) {
                    result = await updateSubtitleStyles({ 
                        data,
                        subtitleStylesId: subtitleStyles.id,
                        transcription: selectedTranscription
                    });
                }else {
                    result = await createSubtitleStyles({
                        data,
                        transcription: selectedTranscription
                    });

                    if (result.subtitleStylesId) {
                        updateStyles(data.transcription, {
                            id: result.subtitleStylesId
                        })
                    }
                }
                
                if (result.error) {
                    toast.error(result.error);
                    updateStyles(data.transcription, {
                        ...data
                    })
                    return;
                }
                
                toast.success(result.message);
                queryClient.invalidateQueries({ queryKey: settingsQueries.general._def })
            } finally {
                setIsLoading(false);
            }
        }
    }

    const handleReset = () => {
      deleteStyles(selectedTranscription)
    }

    if(!subtitleStyles) {
        return <SubtitleStylesSkeleton />
    }

    return (
        <div className="w-full">
            <div className="flex flex-col gap-0">
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                    <div className="text-lg font-semibold">Subtitle Styles</div>
                    <div className="flex flex-row gap-2">
                        <SubtitleTranscriptionSelector
                            selectedTranscription={selectedTranscription}
                            setSelectedTranscription={setSelectedTranscription}
                        />
                        {(subtitleStyles && styles && styles[selectedTranscription]) && (
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