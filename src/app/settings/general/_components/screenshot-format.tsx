"use client"

import TooltipWrapper from "@/components/tooltip-wrapper";
import { Input } from "@/components/ui/input";
import { GeneralSettings } from "@/lib/db/schema";
import { settingsQueries } from "@/lib/queries/settings";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { defaultGeneralSettings, screenshotFormats } from "@/lib/constants/settings";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { handleScreenshotFormat } from "@/app/settings/general/actions";
import { SelectInput } from "@/components/form/select-input";

export default function ScreenshotFormat({ value }: { value: GeneralSettings['screenshotFormat'] }) {
    const [format, setFormat] = useState<GeneralSettings['screenshotFormat']>(value || defaultGeneralSettings.screenshotFormat)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleChange = async (format: GeneralSettings['screenshotFormat']) => {
        setIsLoading(true);

        const { error, message } = await handleScreenshotFormat({ format: format });

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
                    onChange={(v) =>{ 
                        const newFormat = v as GeneralSettings['screenshotFormat']
                        setFormat(newFormat)
                        handleChange(newFormat) // Pass the new value directly
                    }}
                    disabled={isLoading}
                    value={format}
                />
                {format != defaultGeneralSettings.screenshotFormat && (
                    <Button
                        variant='destructive'
                        onClick={() => {
                            setFormat(defaultGeneralSettings.screenshotFormat)
                            handleChange(defaultGeneralSettings.screenshotFormat)
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