'use client'

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { WordSettings } from "@/lib/db/schema";
import { handleWordSettings } from "@/app/settings/word/_settings/actions";

interface UseWordSettingsProps<T extends keyof Omit<WordSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> {
  initialValue: WordSettings[T];
  field: T;
  successMessage?: string;
  errorMessage?: string;
}

export function useWordSettings<T extends keyof Omit<WordSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
  initialValue,
  field,
  successMessage,
  errorMessage
}: UseWordSettingsProps<T>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localValue, setLocalValue] = useState<WordSettings[T] | null>(null);
  const queryClient = useQueryClient();

  const displayValue = useMemo(() => {
    return localValue !== null ? localValue : initialValue
  }, [localValue, initialValue]);

  const onSubmit = async (value: WordSettings[T]) => {
    setLocalValue(value);
    setIsLoading(true);
    try {
        const { message, error } = await handleWordSettings({ [field]: value });
        if (error) throw new Error(error);
        queryClient.invalidateQueries({ queryKey: settingsQueries.word._def });
        toast.success(message || successMessage || `${field} updated successfully`);
    } catch (err) {
      setLocalValue(null);
      const errorMsg = err instanceof Error ? err.message : errorMessage || `Failed to update ${field}`;
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (v: WordSettings[T]) => {
    setLocalValue(v)
  }

  return {
    isLoading,
    displayValue,
    onSubmit,
    onChange
  };
}