import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { SubtitleSettings } from "@/lib/db/schema";
import { handleSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/actions";

interface UseSubtitleSettingsProps<T extends keyof Omit<SubtitleSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  initialValue: SubtitleSettings[T];
  field: T;
  successMessage?: string;
  errorMessage?: string;
}

export function useSubtitleSettings<T extends keyof Omit<SubtitleSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
  initialValue,
  field,
  successMessage,
  errorMessage
}: UseSubtitleSettingsProps<T>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<SubtitleSettings[T] | null>(null);
  const queryClient = useQueryClient();

  const displayValue = useMemo(() => {
    return localValue !== null ? localValue : initialValue
  }, [localValue, initialValue]);

  const onSubmit = async (value: SubtitleSettings[T]) => {
    setLocalValue(value);
    setIsLoading(true);
    try {
        const { message, error } = await handleSubtitleSettings({ [field]: value });
        if (error) throw new Error(error);
        queryClient.invalidateQueries({ queryKey: settingsQueries.subtitle._def });
        toast.success(message || successMessage || `${field} updated successfully`);
    } catch (err) {
      setLocalValue(null);
      const errorMsg = err instanceof Error ? err.message : errorMessage || `Failed to update ${field}`;
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (v: SubtitleSettings[T]) => {
    setLocalValue(v)
  }

  return {
    isLoading,
    displayValue,
    onSubmit,
    onChange
  };
}