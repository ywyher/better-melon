'use client'

import { SelectInput } from "@/components/form/select-input";
import { fontFamilies, fontWeights } from "@/lib/constants/subtitle";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";
import { useMemo } from "react";

export default function FontWeightController({ 
  transcription, 
  value,
  source,
  syncPlayerSettings,
  state
}: FieldControllerProps) {
  const { isLoading, displayValue, onSubmit } = useStyleFieldController({
    transcription,
    initialValue: value,
    source,
    syncPlayerSettings,
    state,
    field: 'fontWeight',
    successMessage: 'Font weight updated successfully',
    errorMessage: 'Failed to update font weight'
  });
  
  const fontWeightOptions = useMemo(() => {
    return fontWeights.map(weight => ({ value: weight, label: weight }))
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <p>Font Weight</p>
      <SelectInput 
        options={fontWeightOptions} 
        placeholder="Select font weight"
        onValueChange={(v) => onSubmit(v)}
        disabled={isLoading}
        value={displayValue}
      />
    </div>
  )
}