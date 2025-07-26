'use client'

import { Switch } from "@/components/ui/switch";
import { WordSettings } from "@/lib/db/schema";
import { useWordSettings } from "@/lib/hooks/use-word-settings";

export default function PitchColoring({ value }: { 
    value: WordSettings['pitchColoring']
}) {
    const { displayValue, isLoading, onSubmit } = useWordSettings({
        field: 'pitchColoring',
        initialValue: value,
    })
    
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2">
            <div className="col-span-1 space-y-1">
                <h3 className="font-medium">Pitch Coloring</h3>
                <p className="text-sm text-muted-foreground">
                    Color words depending on its learning status
                </p>
            </div>
            <div className="col-span-1 flex justify-end">
                <Switch
                    checked={displayValue}
                    onCheckedChange={(v) => onSubmit(v)}
                    disabled={isLoading}
                    className="mt-2 md:mt-0"
                />
            </div>
        </div>
    )
}