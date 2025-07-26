"use client"

import { handleEnabledTranscriptions } from "@/app/settings/player/actions";
import MultipleSelector from "@/components/multiple-selector";
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { PlayerSettings as TPlayerSettings } from "@/lib/db/schema";
import { settingsQueries } from "@/lib/queries/settings";
import { SubtitleTranscription } from "@/types/subtitle";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export default function EnabledTranscriptionsSettings({ playerSettings }: { playerSettings: TPlayerSettings }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const [selectedTranscriptions, setSelectedTranscriptions] = useState<SubtitleTranscription[]>(
        playerSettings.enabledTranscriptions || []
    );
    const [debouncedTranscriptions] = useDebounce(selectedTranscriptions, 1000)

    const onTranscriptionsChange = useCallback(async (transcriptions: SubtitleTranscription[]) => {
        if (JSON.stringify(transcriptions) === JSON.stringify(playerSettings.enabledTranscriptions)) {
            return;
        }
        
        setIsLoading(true);
        const { message, error } = await handleEnabledTranscriptions({ transcriptions });

        if (error) {
            toast.error(error);
            setIsLoading(false);
            setSelectedTranscriptions(playerSettings.enabledTranscriptions || []);
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: settingsQueries.player._def });
        toast.success(message || "Transcription settings updated");
        setIsLoading(false);
    }, [playerSettings.enabledTranscriptions, queryClient]);


    useEffect(() => {
        onTranscriptionsChange(debouncedTranscriptions)
    }, [debouncedTranscriptions, onTranscriptionsChange])

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-between md:grid grid-cols-2">
                <div className="col-span-1 space-y-1">
                    <h3 className="font-medium">Enabled transcriptions</h3>
                    <p className="text-sm text-muted-foreground">Transcriptions enabled by default</p>
                </div>
                <div>
                    <MultipleSelector
                        disabled={isLoading}
                        placeholder="Select transcriptions to enable"
                        options={subtitleTranscriptions.map((transcirption) => ({
                            value: transcirption,
                            label: transcirption,
                        }))}
                        value={selectedTranscriptions.map((transcription) => ({
                            value: transcription,
                            label: transcription,
                        }))}
                        onChange={(transcriptions) => {
                            setSelectedTranscriptions(transcriptions.map(t => t.value as SubtitleTranscription));
                        }}
                        className="w-full col-span-1"
                    />
                </div>
            </div>
        </div>
    );
}