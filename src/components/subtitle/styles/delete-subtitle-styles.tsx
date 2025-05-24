"use client"

import LoadingButton from "@/components/loading-button"
import { deleteSubtitleStyles } from "@/components/subtitle/styles/actions";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { GeneralSettings, PlayerSettings, SubtitleStyles } from "@/lib/db/schema"
import { settingsQueries } from "@/lib/queries/settings";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { SyncStrategy } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";

type RemoveSubtitleStylesProps = {
  syncPlayerSettings: GeneralSettings['syncPlayerSettings'];
  transcription: SubtitleStyles['transcription'];
  source: 'store' | 'database';
  subtitleStylesId: SubtitleStyles['id']
}

export default function DeleteSubtitleStyles({
  syncPlayerSettings,
  transcription,
  source,
  subtitleStylesId,
}: RemoveSubtitleStylesProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const deleteStyles = useSubtitleStylesStore((state) => state.deleteStyles)
  const queryClient = useQueryClient()

  const handleRemove = async () => {
    setIsLoading(true);

    try {
      if (source === 'database') {
        const { message, error } = await deleteSubtitleStyles({
          subtitleStylesId
        });
        if (error) throw new Error(error);
        queryClient.invalidateQueries({ queryKey: settingsQueries.subtitleStyles._def });
        toast.success(message);
      } else {
        deleteStyles(transcription);
        
        let resolvedStrategy = syncPlayerSettings as SyncStrategy;
        
        if (resolvedStrategy === 'ask') {
          const result = await showSyncSettingsToast();
          if (result.error) {
            toast.error(result.error);
            return;
          }
          
          if (!result.strategy) {
            toast.success(`Styles removed successfully`);
            return;
          }
          
          resolvedStrategy = result.strategy;
        }
        
        if (resolvedStrategy === 'always' || resolvedStrategy === 'once') {
          const { message, error } = await deleteSubtitleStyles({
            subtitleStylesId
          });
          if (error) throw new Error(error);
          queryClient.invalidateQueries({ queryKey: settingsQueries.subtitleStyles._def });
          queryClient.invalidateQueries({ queryKey: settingsQueries.general._def });
          toast.success(message);
        } else {
          toast.success(`Styles removed successfully`);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to removed styles`;
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LoadingButton
      variant='destructive'
      className="w-fit"
      isLoading={isLoading}
      onClick={() => handleRemove()}
    >
      <X />
    </LoadingButton>
  )
}