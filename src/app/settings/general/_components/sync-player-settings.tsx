"use client"

import { handleSyncPlayerSettings } from "@/app/settings/general/actions";
import OptionToggleGroup from "@/components/option-toggle-group";
import { syncStrategies } from "@/lib/constants";
import { GeneralSettings } from "@/lib/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function SyncPlayerSettings({ settings }: { settings: GeneralSettings }) {
    const [selectedOption, setSelectedOption] = useState<GeneralSettings['syncPlayerSettings']>(settings.syncPlayerSettings || 'ask')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()

    const handleValueChange = async (newValue: GeneralSettings['syncPlayerSettings']) => {
        setSelectedOption(newValue);
        setIsLoading(true);
        
        const { error, message } = await handleSyncPlayerSettings({ strategy: newValue });

        if(error) {
            toast.error(error);
            setIsLoading(false);
            setSelectedOption(settings.syncPlayerSettings);
            return;
        }

        toast.success(message);
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: ['settings', 'general-settings'], exact: true });
    };
        
    return (
        <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2 pb-4">
            <div className="col-span-1 space-y-1">
                <h3 className="font-medium">Sync player settings</h3>
                <p className="text-sm text-muted-foreground">
                    Changes made in the player page will be saved in the database instead of locally
                </p>
            </div>
            <div className="col-span-1 flex justify-end">
                <OptionToggleGroup
                    options={syncStrategies} 
                    value={selectedOption}
                    onValueChange={handleValueChange}
                    disabled={isLoading}
                />
            </div>
        </div>
    )
}