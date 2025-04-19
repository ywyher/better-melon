'use client'

import { handleDeleteMatchPattern, handleMatchPattern } from "@/app/settings/subtitle/_subtitle-settings/actions"
import LoadingButton from "@/components/loading-button"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SubtitleSettings } from "@/lib/db/schema"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, X } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { useDebounce } from "use-debounce"
  
export default function SubtitleSettingsMatchPattern({ settingsId, matchPattern }: { 
    settingsId: SubtitleSettings['id']
    matchPattern: SubtitleSettings['matchPattern']
}) {
    const [inputValue, setInputValue] = useState<string>(matchPattern ?? "")
    const [debouncedValue] = useDebounce(inputValue, 500)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isInitialRender, setIsInitialRender] = useState<boolean>(true)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (isInitialRender) return;
        
        if(debouncedValue) {
            onMatchPattern(debouncedValue)
        }
    }, [debouncedValue])

    const onMatchPattern = async (matchPattern: SubtitleSettings['matchPattern']) => {
        setIsLoading(true)
        const { message, error } = await handleMatchPattern({ matchPattern })

        if(error) {
            toast.error(error)
            setIsLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle-settings'], exact: true })
        toast.success(message)
        setIsLoading(false)
    }

    const onDeleteMatchPattern = async (settingsId: SubtitleSettings['id']) => {
        setIsLoading(true)
        const { message, error } = await handleDeleteMatchPattern({ settingsId })

        if(error) {
            toast.error(error)
            setIsLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['settings', 'subtitle-settings'], exact: true })
        toast.success(message)
        setIsLoading(false)
        setInputValue("")
    }

    return (
        <div className="flex flex-col gap-3">
        <div className="flex flex-col md:grid md:grid-cols-8 items-start md:items-center gap-4">
            <div className="w-full md:col-span-4 flex flex-col md:flex-row gap-1">
            <div className="flex flex-wrap gap-1.5 text-sm font-medium">
                <p>Prioritize files whose names match this</p>
                <Badge variant='secondary'>keyword</Badge>
                <p>or</p>
                <Badge variant='secondary'>regex</Badge>
                <p>pattern.</p>
            </div>
            <TooltipWrapper
                tooltip="Prioritize the preferred subtitle format but if not found fallback to other formats"
            >
                <AlertCircle className="w-4 h-4 text-amber-300 cursor-pointer mt-1" />
            </TooltipWrapper>
            </div>
            <div className="w-full md:col-span-4 flex flex-row gap-3">
            <Input
                placeholder="Keyword or Regex"
                value={inputValue}
                onChange={(e) => {
                if(isInitialRender) {
                    setIsInitialRender(false)
                }
                setInputValue(e.currentTarget.value)
                }}
                className="flex-1"
            />
            {matchPattern && (
                <LoadingButton
                isLoading={isLoading}
                variant="destructive"
                className="w-fit"
                onClick={() => onDeleteMatchPattern(settingsId)}
                >
                <X />
                </LoadingButton>
            )}
            </div>
        </div>
        </div>
    )
}