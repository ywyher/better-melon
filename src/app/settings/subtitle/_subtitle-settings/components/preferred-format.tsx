'use client'

import { handleDeletePreferredFormat, handlePreferredFormat } from "@/app/settings/subtitle/_subtitle-settings/actions"
import LoadingButton from "@/components/loading-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { subtitleFormats } from "@/lib/constants/subtitle"
import { SubtitleSettings } from "@/lib/db/schema"
import { useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
  
export default function SubtitleSettingsPreferredFormat({ settingsId, preferredFormat }: { 
    settingsId: SubtitleSettings['id']
    preferredFormat: SubtitleSettings['preferredFormat']
 }) {
    const [isFormatLoading, setIsFormatLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const onPreferredFormat = async (format: SubtitleSettings['preferredFormat']) => {
        setIsFormatLoading(true)
        const { message, error } = await handlePreferredFormat({ format })

        if(error) {
            toast.error(error)
            setIsFormatLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle-settings'] })
        toast.success(message)
        setIsFormatLoading(false)
    }

    const onDeletePreferredFormat = async (settingsId: SubtitleSettings['id']) => {
        setIsFormatLoading(true)
        const { message, error } = await handleDeletePreferredFormat({ settingsId })

        if(error) {
            toast.error(error)
            setIsFormatLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle-settings'] })
        toast.success(message)
        setIsFormatLoading(false)
    }

    return (
        <div className="flex flex-col gap-3">
        <div className="flex flex-col md:grid md:grid-cols-8 items-start md:items-center gap-4">
            <div className="w-full md:col-span-4 text-sm font-medium">Preferred format</div>
            <div className="w-full md:col-span-4 flex flex-row gap-3">
            <Select
                value={preferredFormat || ""}
                onValueChange={v => onPreferredFormat(v as SubtitleSettings['preferredFormat'])}
                disabled={isFormatLoading}
            >
                <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                {subtitleFormats.map((format, idx) => (
                    <SelectItem key={idx} value={format}>{format}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            {preferredFormat && (
                <LoadingButton
                isLoading={isFormatLoading}
                variant="destructive"
                className="w-fit"
                onClick={() => onDeletePreferredFormat(settingsId)}
                >
                <X />
                </LoadingButton>
            )}
            </div>
        </div>
        </div>
    )
}