"use client"

import { GeneralSettings } from "@/lib/db/schema";
import { defaultGeneralSettings, screenshotFormats } from "@/lib/constants/settings";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SelectInput } from "@/components/form/select-input";
import { useGeneralSettings } from "@/lib/hooks/use-general-settings";

export default function ScreenshotFormat({ value }: { value: GeneralSettings['screenshotFormat'] }) {
    const { isLoading, displayValue, onSubmit } = useGeneralSettings({
        initialValue: value,
        field: "screenshotFormat",
    });
    
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <div className="flex flex-row gap-2">
                    <h3 className="font-medium">Screenshot format</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    Screenshot format
                </p>
            </div>
            <div className="flex flex-row gap-2 col-span-1 justify-end">
                <SelectInput 
                    options={screenshotFormats.map((f) => {
                        return { value: f, label: f }
                    })}
                    onValueChange={(v) =>{ 
                        const newFormat = v as GeneralSettings['screenshotFormat']
                        onSubmit(newFormat)
                    }}
                    disabled={isLoading}
                    value={displayValue}
                />
                {displayValue != defaultGeneralSettings.screenshotFormat && (
                    <Button
                        variant='destructive'
                        onClick={() => {
                            onSubmit(defaultGeneralSettings.screenshotFormat)
                        }}
                        className="w-fit"
                    >
                        <X />
                    </Button>
                )}
            </div>
        </div>
    )
}