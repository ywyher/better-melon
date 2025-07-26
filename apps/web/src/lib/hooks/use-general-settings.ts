import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { GeneralSettings } from "@/lib/db/schema";
import { handleGeneralSettings } from "@/app/settings/general/actions";

interface UseGeneralSettingsProps<T extends keyof Omit<GeneralSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  initialValue: GeneralSettings[T];
  field: T;
  successMessage?: string;
  errorMessage?: string;
}

export function useGeneralSettings<T extends keyof Omit<GeneralSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
  initialValue,
  field,
  successMessage,
  errorMessage
}: UseGeneralSettingsProps<T>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<GeneralSettings[T] | null>(null);
  const queryClient = useQueryClient();

  const displayValue = useMemo(() => {
    return localValue !== null ? localValue : initialValue
  }, [localValue, initialValue]);

  const onSubmit = async (value: GeneralSettings[T]) => {
    setLocalValue(value);
    setIsLoading(true);
    try {
        const { message, error } = await handleGeneralSettings({ [field]: value });
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

  const onChange = (v: GeneralSettings[T]) => {
    setLocalValue(v)
  }

  return {
    isLoading,
    displayValue,
    onSubmit,
    onChange
  };
}