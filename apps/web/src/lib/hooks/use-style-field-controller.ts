import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { handleSubtitleStyles } from "@/components/subtitle/styles/actions";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { GeneralSettings, SubtitleStyles } from "@/lib/db/schema";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";

interface UseStyleSubtitleStylesControllerProps {
  transcription: SubtitleStyles['transcription'];
  initialValue: any;
  source: 'database' | 'local' | string;
  field: keyof Omit<SubtitleStyles, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  syncSettings: GeneralSettings['syncSettings']
  state: SubtitleStyles['state']
  successMessage?: string;
  errorMessage?: string;
}

export function useStyleFieldController({
  transcription,
  initialValue,
  source,
  field,
  syncSettings,
  state,
  successMessage,
  errorMessage
}: UseStyleSubtitleStylesControllerProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<any>(null);
  const [displayValue, setDisplayValue] = useState<string>('')
  const queryClient = useQueryClient();
  const handleStyles = useSubtitleStylesStore((state) => state.handleStyles);
  
  const { handleSync } = useSyncSettings({
    syncSettings,
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error),
    invalidateQueries: [settingsQueries.subtitleStyles._def]
  });

  useEffect(() => {
    if(localValue) {
      setDisplayValue(localValue)
    }
  }, [localValue])

  useEffect(() => {
    setDisplayValue(initialValue)
  }, [initialValue])

  const onSubmit = async (value: any) => {
    setLocalValue(value);
    setIsLoading(true);

    try {
      if (source === 'database') {
        const { message, error } = await handleSubtitleStyles({
          field,
          value,
          transcription,
          state
        });
        if (error) throw new Error(error);
        queryClient.invalidateQueries({ queryKey: settingsQueries.subtitleStyles._def });
        toast.success(message || successMessage || `${field} updated successfully`);
      } else {
        const { success } = await handleSync({
          localOperation: () => handleStyles(transcription, { [field]: value }, state),
          serverOperation: () => handleSubtitleStyles({
            field,
            value,
            transcription,
            state
          }),
          successMessage: successMessage || `${field} updated successfully`
        });
        
        if (!success) {
          setLocalValue(null);
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