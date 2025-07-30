"use client"

import TooltipWrapper from "@/components/tooltip-wrapper";
import { Switch } from "@/components/ui/switch";
import { GeneralSettings } from "@/lib/db/schema";
import { useGeneralSettings } from "@/lib/hooks/use-general-settings";

export default function ScreenshotNamingDialog({ value }: { value: GeneralSettings['screenshotNamingDialog'] }) {
    const { isLoading, displayValue, onSubmit } = useGeneralSettings({
        initialValue: value,
        field: "screenshotNamingDialog",
    });
    
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <div className="flex flex-row gap-1">
                    <h3 className="font-medium">Screenshot naming dialog</h3>
                    <TooltipWrapper>
                        If disabled screenshot names will follow the naming pattern
                    </TooltipWrapper>
                </div>
                <p className="text-sm text-muted-foreground">
                    Whether to show a naming dialog when saving a screenshot or no
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