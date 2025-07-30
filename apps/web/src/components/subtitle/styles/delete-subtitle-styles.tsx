"use client"

import LoadingButton from "@/components/loading-button"
import { deleteSubtitleStyles } from "@/components/subtitle/styles/actions";
import { GeneralSettings, SubtitleStyles } from "@/lib/db/schema"
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";
import { settingsQueries } from "@/lib/queries/settings";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";

type RemoveSubtitleStylesProps = {
  syncSettings: GeneralSettings['syncSettings'];
  transcription: SubtitleStyles['transcription'];
  source: 'store' | 'database';
  subtitleStylesId: SubtitleStyles['id']
  state: SubtitleStyles['state']
}

export default function DeleteSubtitleStyles({
  syncSettings,
  transcription,
  source,
  subtitleStylesId,
  state
}: RemoveSubtitleStylesProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const deleteStyles = useSubtitleStylesStore((state) => state.deleteStyles)
  const queryClient = useQueryClient()

  const { handleSync } = useSyncSettings({
    syncSettings,
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error),
    invalidateQueries: [settingsQueries.subtitleStyles._def]
  });

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
        await handleSync({
          localOperation: () => deleteStyles(transcription, state),
          serverOperation: () => deleteSubtitleStyles({ 
            subtitleStylesId
          }),
          successMessage: "Styles removed successfully"
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to reset styles`;
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