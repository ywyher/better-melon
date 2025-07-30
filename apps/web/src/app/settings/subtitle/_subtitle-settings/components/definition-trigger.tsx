'use client'

import SegmentedToggle from "@/components/segmented-toggle"
import TooltipWrapper from "@/components/tooltip-wrapper"
import { definitionTrigger } from "@/lib/constants/subtitle"
import { SubtitleSettings } from "@/lib/db/schema"
import { useSubtitleSettings } from "@/lib/hooks/use-subtitle-settings"
  
export default function DefinitionTrigger({ value }: { 
    value: SubtitleSettings['definitionTrigger']
 }) {
    const { displayValue, isLoading, onSubmit } = useSubtitleSettings({
        field: 'definitionTrigger',
        initialValue: value,
    })

    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="font-medium">Definition Trigger</h3>
                    <TooltipWrapper>
                        Doesn't apply to the subtitles at the panel (should it ?)
                    </TooltipWrapper>
                </div>
                <p className="text-sm text-muted-foreground">
                    Whether to show the definition of a word on click or hover
                </p>
            </div>
            <div className="col-span-1 flex flex-row gap-2 justify-end">
                <SegmentedToggle 
                    onValueChange={v => onSubmit(v as SubtitleSettings['definitionTrigger'])}
                    value={displayValue}
                    disabled={isLoading}
                    options={definitionTrigger}
                />
            </div>
        </div>
    )
}