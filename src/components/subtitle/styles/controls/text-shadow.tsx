'use client'

import { SelectInput } from "@/components/form/select-input";
import { textShadowTypes } from "@/lib/constants/subtitle";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";
import { useMemo } from "react";

export default function TextShadowController({ 
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
    field: 'textShadow',
    successMessage: 'Text shadow updated successfully',
    errorMessage: 'Failed to update text shadow'
  });
  
  const textShadowOptions = useMemo(() => {
    return textShadowTypes.map(shadow => ({ value: shadow, label: shadow }))
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <p>Text Shadow</p>
      <SelectInput 
        options={textShadowOptions} 
        placeholder="Select text shadow"
        onValueChange={(v) => onSubmit(v)}
        disabled={isLoading}
        value={displayValue}
      />
    </div>
  )
}