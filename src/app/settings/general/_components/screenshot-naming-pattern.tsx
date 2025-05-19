"use client"

import { handleScreenshotNamingPattern } from "@/app/settings/general/actions";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { Input } from "@/components/ui/input";
import { GeneralSettings } from "@/lib/db/schema";
import { settingsQueries } from "@/lib/queries/settings";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ScreenshotNamingPatternInstructions from "@/app/settings/general/_components/screenshot-naming-pattern-instructions";
import { defaultGeneralSettings } from "@/lib/constants/settings";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ScreenshotNamingPattern({ value }: { value: GeneralSettings['screenshotNamingPattern'] }) {
    const [pattern, setPattern] = useState<string>(value || defaultGeneralSettings.screenshotNamingPattern)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleChange = async (pattern: GeneralSettings['screenshotNamingPattern']) => {
        if(pattern == value) return;

        if(!pattern) {
            setPattern(defaultGeneralSettings.screenshotNamingPattern)
        }

        setIsLoading(true);

        const { error, message } = await handleScreenshotNamingPattern({ 
            pattern: pattern ? pattern : defaultGeneralSettings.screenshotNamingPattern 
        });

        if(error) {
            toast.error(error);
            setIsLoading(false);
            return;
        }

        toast.success(message);
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: settingsQueries.general._def });
    };
    
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
                    value={pattern}
                    onBlur={(e) => handleChange(e.target.value)}
                    onChange={(e) => setPattern(e.target.value)}
                    disabled={isLoading}
                />
                {pattern != defaultGeneralSettings.screenshotNamingPattern && (
                    <Button
                        variant='destructive'
                        onClick={() => {
                            setPattern(defaultGeneralSettings.screenshotNamingPattern)
                            handleChange(defaultGeneralSettings.screenshotNamingPattern)
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