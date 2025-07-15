'use client'

import { SelectInput } from "@/components/form/select-input";
import { fontFamilies } from "@/lib/constants/subtitle";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { SubtitleStylesControllerProps } from "@/types/subtitle";
import { useMemo } from "react";

export default function FontFamilyController({ 
  transcription, 
  value,
  source,
  syncSettings,
  state
}: SubtitleStylesControllerProps) {
  const { isLoading, displayValue, onSubmit } = useStyleFieldController({
    transcription,
    initialValue: value,
    source,
    syncSettings,
    state,
    field: 'fontFamily',
    successMessage: 'Font family updated successfully',
    errorMessage: 'Failed to update font family'
  });
  
  const fontFamilyOptions = useMemo(() => {
    return fontFamilies.map(family => ({ value: family, label: family }))
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <p>Font Family</p>
      <SelectInput 
        options={fontFamilyOptions} 
        placeholder="Select font family"
        onChange={(v) => onSubmit(v)}
        disabled={isLoading}
        value={displayValue}
      />
    </div>
  )
}