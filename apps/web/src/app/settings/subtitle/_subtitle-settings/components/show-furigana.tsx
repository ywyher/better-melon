'use client'

import { Switch } from "@/components/ui/switch"
import { SubtitleSettings } from "@/lib/db/schema"
import { useSubtitleSettings } from "@/lib/hooks/use-subtitle-settings"
  
export default function ShowFurigana({ value }: { 
    value: SubtitleSettings['showFurigana']
 }) {
    const { displayValue, isLoading, onSubmit } = useSubtitleSettings({
        field: 'showFurigana',
        initialValue: value,
    })

    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <div className="flex flex-row gap-2 items-center">
                    <h3 className="font-medium">Show Furigana</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    Whether to display furigiana or not
                </p>
            </div>
            <div className="col-span-1 flex flex-row gap-2 justify-end">
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