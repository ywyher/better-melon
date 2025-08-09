'use client'

import { NumberInput } from "@/components/form/number-input"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { Button } from "@/components/ui/button"
import { PlayerSettings } from "@/lib/db/schema"
import { usePlayerSettings } from "@/lib/hooks/use-player-settings"
import { X } from "lucide-react"
import { useState } from "react"
  
export default function AutoScrollResumeDelay({ value }: { 
    value: PlayerSettings['autoScrollResumeDelay']
}) {
    const { isLoading, onSubmit } = usePlayerSettings({
        field: 'autoScrollResumeDelay',
        initialValue: value,
    })

    // we use these here since with display value we get some bugs !
    const [inputValue, setInputValue] = useState<number | null>(value !== undefined ? value : null)

    const handleChange = (val: number | null) => {
        setInputValue(val)
    }

    const handleSubmit = (val: number | null) => {
        if(!val) return;
        onSubmit(val)
    }

    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="font-medium">Cue pause duration <i className="text-gray-400">(in seconds)</i></h3>
                    <TooltipWrapper>
                        No value {"->"} will immediatly scroll to active cue
                    </TooltipWrapper>
                </div>
                <p className="text-sm text-muted-foreground">
                    If the user scrolls the panel manually, auto-scrolling is paused. 
                    Once the user stops interacting, a countdown (defined by the duration option) starts before auto-scrolling resumes.
                </p>
            </div>
            <div className="col-span-1 flex flex-row gap-2 justify-end">
                <NumberInput
                    value={inputValue !== null ? inputValue : ""}
                    onBlur={handleSubmit}
                    onChange={handleChange}
                    disabled={isLoading}
                    max={3600}
                />
                {inputValue !== null && (
                    <Button
                        onClick={() => {
                            handleSubmit(null)
                            setInputValue(null)
                        }}
                        variant='destructive'
                        disabled={isLoading}
                    >
                        <X />
                    </Button>
                )}
            </div>
        </div>
    )
}