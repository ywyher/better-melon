"use client"

import SegmentedToggle from "@/components/segmented-toggle";
import { syncStrategies } from "@/lib/constants";
import { GeneralSettings } from "@/lib/db/schema";
import { useGeneralSettings } from "@/lib/hooks/use-general-settings";

export default function SyncPlayerSetting({ value }: { value: GeneralSettings['syncSettings'] }) {
    const { isLoading, displayValue, onSubmit } = useGeneralSettings({
        initialValue: value,
        field: "syncSettings",
    });
        
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <h3 className="font-medium">Sync player settings</h3>
                <p className="text-sm text-muted-foreground">
                    Changes made in the player page will be saved in the database instead of locally
                </p>
            </div>
            <div className="col-span-1 flex justify-end">
                <SegmentedToggle
                    options={syncStrategies} 
                    value={displayValue}
                    onValueChange={onSubmit}
                    disabled={isLoading}
                />
            </div>
        </div>
    )
}