'use client'

import { Switch } from "@/components/ui/switch"
import { PlayerSettings } from "@/lib/db/schema"
import { usePlayerSettings } from "@/lib/hooks/use-player-settings"
  
export default function AutoSkip({ value }: { 
    value: PlayerSettings['autoSkip']
}) {
    const { displayValue, isLoading, onSubmit } = usePlayerSettings({
        field: 'autoSkip',
        initialValue: value,
    })

    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2">
            <div className="col-span-1 space-y-1">
                <h3 className="font-medium">Auto Skip</h3>
                <p className="text-sm text-muted-foreground">
                    Automatically skip intro/outro segments
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