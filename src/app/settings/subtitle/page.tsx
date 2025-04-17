"use client"

import { createSubtitleSettings, deleteSubtitleSettings, getGlobalSubtitleSettings, updateSubtitleSettings } from "@/app/settings/subtitle/actions";
import SubtitleSettingsControls from "@/components/subtitle/subtitle-settings-controls"
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleSettingsSkeleton from "@/components/subtitle/subtitle-settings-skeleton";
import { SubtitleSettings as TSubtitleSettings } from "@/lib/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subtitleSettingsSchema } from "@/app/settings/subtitle/types";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function SubtitleSettings() {
    const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleSettings['transcription']>('all')
    const [operation, setOperation] = useState<'create' | 'update'>('create')

    const { data: subtitleSettings, isLoading: isSubtitleSettingsLoading, isRefetching, isRefetchError } = useQuery({
        queryKey: ['settings', 'subtitle', selectedTranscription],
        queryFn: async () => {
            return await getGlobalSubtitleSettings({ transcription: selectedTranscription }) as TSubtitleSettings;
        },
        refetchOnWindowFocus: false
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

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

    useEffect(() => {
        if(subtitleSettings?.id && (selectedTranscription == subtitleSettings.transcription)) {
            setOperation('update')
        }else {
            setOperation('create')
        }
    }, [subtitleSettings])

    const onSubmit = async (data: z.infer<typeof subtitleSettingsSchema>) => {
        if(!operation || !subtitleSettings) return;
        setIsLoading(true)
        try {
            let result;

            if(operation == 'update') {
                result = await updateSubtitleSettings({ 
                    data, 
                    subtitleSettingsId: subtitleSettings.id,
                    transcription: selectedTranscription
                })
            }else {
                result = await createSubtitleSettings({ 
                    data,
                    transcription: selectedTranscription                    
                })
            }

            if(result.error) {
                toast.error(result.error)
                setIsLoading(false)
                return;
            }
            
            queryClient.invalidateQueries({ queryKey: ['session'] })
            queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle'] })
            toast.success(result.message)
            setIsLoading(false)
        } catch (error) {
            toast.error("Failed to apply settings")
            setIsLoading(false)
        }
    }

    const handleReset = async () => {
        if(!subtitleSettings) return;

        const { error, message } = await deleteSubtitleSettings({ 
            subtitleSettingsId: subtitleSettings.id,
        })

        if(error) {
            toast.error(error)
            setIsLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle'] })
        toast.success(message)
        setIsLoading(false)
    }

    if(!subtitleSettings || isSubtitleSettingsLoading || isRefetching) {
        return <SubtitleSettingsSkeleton />
    }

    return (
        <div className="flex flex-col gap-0 pt-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
                <div className="text-xl font-semibold">Subtitle Settings</div>
                <div className="flex flex-row gap-2">
                    <SubtitleTranscriptionSelector
                        selectedTranscription={selectedTranscription}
                        setSelectedTranscription={setSelectedTranscription}
                    />
                    {subtitleSettings.id && (
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
                method="submit"
            />
        </div>
    )
}