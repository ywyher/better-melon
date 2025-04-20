"use client"

import { createSubtitleStyles, deleteSubtitleStyles, getSubtitleStyles, updateSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/actions";
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleStylesSkeleton from "@/components/subtitle/subtitle-styles-skeleton";
import { SubtitleStyles as TSubtitleStyles } from "@/lib/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { subtitleStylesSchema } from "@/app/settings/subtitle/types";
import SubtitleStylesControls from "@/components/subtitle/subtitle-styles-controls";

export default function SubtitleStyles() {
    const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleStyles['transcription']>('all')
    const [operation, setOperation] = useState<'create' | 'update'>('create')

    const { data: subtitleStyles, isLoading: isSubtitleStylesLoading, isRefetching, isRefetchError } = useQuery({
        queryKey: ['settings', 'subtitle-styles', selectedTranscription],
        queryFn: async () => {
            return await getSubtitleStyles({ transcription: selectedTranscription }) as TSubtitleStyles;
        },
        refetchOnWindowFocus: false
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

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

    useEffect(() => {
        if(subtitleStyles?.id && (selectedTranscription == subtitleStyles.transcription)) {
            setOperation('update')
        }else {
            setOperation('create')
        }
    }, [subtitleStyles])

    const onSubmit = async (data: z.infer<typeof subtitleStylesSchema>) => {
        if(!operation || !subtitleStyles) return;
        setIsLoading(true)
        try {
            let result;

            if(operation == 'update') {
                result = await updateSubtitleStyles({ 
                    data, 
                    subtitleStylesId: subtitleStyles.id,
                    transcription: selectedTranscription
                })
            }else {
                result = await createSubtitleStyles({ 
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
            queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle-styles'] })
            toast.success(result.message)
            setIsLoading(false)
        } catch (error) {
            toast.error("Failed to apply styles")
            setIsLoading(false)
        }
    }

    const handleReset = async () => {
        if(!subtitleStyles) return;

        const { error, message } = await deleteSubtitleStyles({ 
            subtitleStylesId: subtitleStyles.id,
        })

        if(error) {
            toast.error(error)
            setIsLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle', 'styles'] })
        toast.success(message)
        setIsLoading(false)
    }

    if(!subtitleStyles || isSubtitleStylesLoading || isRefetching) {
        return <SubtitleStylesSkeleton />
    }

    return (
        <div className="flex flex-col gap-0">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
                <div className="text-xl font-semibold">Subtitle Styles</div>
                <div className="flex flex-row gap-2">
                    <SubtitleTranscriptionSelector
                        selectedTranscription={selectedTranscription}
                        setSelectedTranscription={setSelectedTranscription}
                    />
                    {subtitleStyles.id && (
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
                method="submit"
            />
        </div>
    )
}