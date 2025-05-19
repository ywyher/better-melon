"use client"

import TooltipWrapper from "@/components/tooltip-wrapper";
import { Input } from "@/components/ui/input";
import { GeneralSettings } from "@/lib/db/schema";
import ScreenshotNamingPatternInstructions from "@/app/settings/general/_components/screenshot-naming-pattern-instructions";
import { defaultGeneralSettings } from "@/lib/constants/settings";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useGeneralSettings } from "@/lib/hooks/use-general-settings";

export default function ScreenshotNamingPattern({ value }: { value: GeneralSettings['screenshotNamingPattern'] }) {
    const { isLoading, displayValue, onSubmit, onChange } = useGeneralSettings({
        initialValue: value,
        field: "screenshotNamingPattern",
    });
    
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <div className="flex flex-row gap-2">
                    <h3 className="font-medium">Screenshot naming dialog</h3>
                    <TooltipWrapper className="flex flex-col">
                        <p>if naming dialog is enabled this will be the default value for it</p>
                        <p>if its disabled the image will instantly get saved with name tha foolows in this pattern</p>
                    </TooltipWrapper>
                </div>
                <p className="text-sm text-muted-foreground">
                    When screenshot is saved its name will be saved in this pattern
                </p>
            </div>
            <div className="flex flex-row gap-2 col-span-1 justify-end">
                <ScreenshotNamingPatternInstructions />
                <Input 
                    className="w-full"
                    value={displayValue}
                    onBlur={(e) => onSubmit(e.target.value)}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isLoading}
                />
                {value != defaultGeneralSettings.screenshotNamingPattern && (
                    <Button
                        variant='destructive'
                        onClick={() => {
                            onChange(defaultGeneralSettings.screenshotNamingPattern)
                            onSubmit(defaultGeneralSettings.screenshotNamingPattern)
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