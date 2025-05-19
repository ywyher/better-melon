import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { playerSettings } from "@/lib/db/schema";
import { handleplayerSettings } from "@/app/settings/player/actions";

interface UsePlayerSettingsProps<T extends keyof Omit<playerSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  initialValue: playerSettings[T];
  field: T;
  successMessage?: string;
  errorMessage?: string;
}

export function usePlayerSettings<T extends keyof Omit<playerSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
  initialValue,
  field,
  successMessage,
  errorMessage
}: UsePlayerSettingsProps<T>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<playerSettings[T] | null>(null);
  const queryClient = useQueryClient();

  const displayValue = useMemo(() => {
    return localValue !== null ? localValue : initialValue
  }, [localValue, initialValue]);

  const onSubmit = async (value: playerSettings[T]) => {
    setLocalValue(value);
    setIsLoading(true);
    try {
        const { message, error } = await handleplayerSettings({ [field]: value });
        if (error) throw new Error(error);
        queryClient.invalidateQueries({ queryKey: settingsQueries.general._def });
        toast.success(message || successMessage || `${field} updated successfully`);
    } catch (err) {
      setLocalValue(null);
      const errorMsg = err instanceof Error ? err.message : errorMessage || `Failed to update ${field}`;
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (v: playerSettings[T]) => {
    setLocalValue(v)
  }

  return {
    isLoading,
    displayValue,
    onSubmit,
    onChange
  };
}