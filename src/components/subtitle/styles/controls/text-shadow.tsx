'use client'

import { SelectInput } from "@/components/form/select-input";
import { fontFamilies, textShadowTypes } from "@/lib/constants/subtitle";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";
import { useMemo } from "react";

export default function FontFamilyController({ 
  transcription, 
  value,
  source,
  syncPlayerSettings
}: FieldControllerProps) {
  const { isLoading, displayValue, onSubmit } = useStyleFieldController({
    transcription,
    initialValue: value,
    source,
    syncPlayerSettings,
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
        onChange={(v) => onSubmit(v)}
        disabled={isLoading}
        value={displayValue}
      />
    </div>
  )
}