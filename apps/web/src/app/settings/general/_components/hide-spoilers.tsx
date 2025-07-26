"use client"

import { Switch } from "@/components/ui/switch";
import { GeneralSettings } from "@/lib/db/schema";
import { useGeneralSettings } from "@/lib/hooks/use-general-settings";

export default function HideSpoilers({ value }: { value: GeneralSettings['hideSpoilers'] }) {
    const { isLoading, displayValue, onSubmit } = useGeneralSettings({
        initialValue: value,
        field: "hideSpoilers",
    });
    
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <h3 className="font-medium">Hide spoilers</h3>
                <p className="text-sm text-muted-foreground">
                    Don't show episdodes image nor title
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