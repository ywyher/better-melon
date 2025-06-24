'use client'

import { Switch } from "@/components/ui/switch";
import { WordSettings } from "@/lib/db/schema";
import { useWordSettings } from "@/lib/hooks/use-word-settings";

export default function LearningStatus({ value }: { 
    value: WordSettings['learningStatus']
}) {
    const { displayValue, isLoading, onSubmit } = useWordSettings({
        field: 'learningStatus',
        initialValue: value,
    })
    
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2">
            <div className="col-span-1 space-y-1">
                <h3 className="font-medium">Learning Status</h3>
                <p className="text-sm text-muted-foreground">
                    Show a special mark under words depending on its learning status
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