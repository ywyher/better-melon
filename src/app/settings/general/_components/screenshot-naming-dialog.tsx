"use client"

import { handleScreenshotNamingDialog } from "@/app/settings/general/actions";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { Switch } from "@/components/ui/switch";
import { GeneralSettings } from "@/lib/db/schema";
import { settingsQueries } from "@/lib/queries/settings";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ScreenshotNamingDialog({ value }: { value: GeneralSettings['screenshotNamingDialog'] }) {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()

    const handleChange = async (newValue: GeneralSettings['screenshotNamingDialog']) => {
        setIsLoading(true);

        const { error, message } = await handleScreenshotNamingDialog({ value: newValue });

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
                    checked={value}
                    onCheckedChange={(v) => handleChange(v)}
                    disabled={isLoading}
                    className="mt-2 md:mt-0"
                />
            </div>
        </div>
    )
}