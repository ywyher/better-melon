import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { handleSubtitleStyles } from "@/components/subtitle/styles/actions";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { GeneralSettings, SubtitleStyles } from "@/lib/db/schema";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { SyncStrategy } from "@/types";

interface UseStyleFieldControllerProps {
  transcription: SubtitleStyles['transcription'];
  initialValue: any;
  source: 'database' | 'local' | string;
  field: keyof Omit<SubtitleStyles, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  syncPlayerSettings: GeneralSettings['syncPlayerSettings']
  successMessage?: string;
  errorMessage?: string;
}

export function useStyleFieldController({
  transcription,
  initialValue,
  source,
  field,
  syncPlayerSettings,
  successMessage,
  errorMessage
}: UseStyleFieldControllerProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<any>(null);
  const queryClient = useQueryClient();
  const handleStyles = useSubtitleStylesStore((state) => state.handleStyles);

  const displayValue = localValue !== null ? localValue : initialValue;

  const onSubmit = async (value: any) => {
    setLocalValue(value);
    setIsLoading(true);

    try {
      if (source === 'database') {
        const { message, error } = await handleSubtitleStyles({
          field,
          value,
          transcription
        });
        if (error) throw new Error(error);
        queryClient.invalidateQueries({ queryKey: settingsQueries.subtitleStyles._def });
        toast.success(message || successMessage || `${field} updated successfully`);
      } else {
        console.log('~source -> store')
        handleStyles(transcription, { [field]: value });
        
        let resolvedStrategy = syncPlayerSettings as SyncStrategy;
        
        if (resolvedStrategy === 'ask') {
          const result = await showSyncSettingsToast();
          if (result.error) {
            toast.error(result.error);
            return;
          }
          
          if (!result.strategy) {
            toast.success(`${field} updated successfully in store`);
            return;
          }
          
          resolvedStrategy = result.strategy;
        }
        
        if (resolvedStrategy === 'always' || resolvedStrategy === 'once') {
          const { message, error } = await handleSubtitleStyles({
            field,
            value,
            transcription
          });
          if (error) throw new Error(error);
          queryClient.invalidateQueries({ queryKey: settingsQueries.subtitleStyles._def });
          queryClient.invalidateQueries({ queryKey: settingsQueries.general._def });
          toast.success(message || successMessage || `${field} updated successfully`);
        } else {
          toast.success(successMessage || `${field} updated successfully in store`);
        }
      }
    } catch (err) {
      setLocalValue(null);
      const errorMsg = err instanceof Error ? err.message : errorMessage || `Failed to update ${field}`;
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    displayValue,
    onSubmit
  };
}