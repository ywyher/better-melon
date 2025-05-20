import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { PlayerSettings } from "@/lib/db/schema";
import { handlePlayerSettings } from "@/app/settings/player/actions";

interface UsePlayerSettingsProps<T extends keyof Omit<PlayerSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  initialValue: PlayerSettings[T];
  field: T;
  successMessage?: string;
  errorMessage?: string;
}

export function usePlayerSettings<T extends keyof Omit<PlayerSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
  initialValue,
  field,
  successMessage,
  errorMessage
}: UsePlayerSettingsProps<T>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<PlayerSettings[T] | null>(null);
  const queryClient = useQueryClient();

  const displayValue = useMemo(() => {
    return localValue !== null ? localValue : initialValue
  }, [localValue, initialValue]);

  const onSubmit = async (value: PlayerSettings[T]) => {
    setLocalValue(value);
    setIsLoading(true);
    try {
        const { message, error } = await handlePlayerSettings({ [field]: value });
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

  const onChange = (v: PlayerSettings[T]) => {
    setLocalValue(v)
  }

  return {
    isLoading,
    displayValue,
    onSubmit,
    onChange
  };
}