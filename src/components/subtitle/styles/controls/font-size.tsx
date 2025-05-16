'use client'

import { SliderInput } from "@/components/form/slider-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";

export default function FontSizeController({
  transcription,
  value,
  source,
  syncPlayerSettings
}: FieldControllerProps) {
  const { isLoading, displayValue, onSubmit } = useStyleFieldController({
    transcription,
    initialValue: value,
    source,
    field: 'fontSize',
    syncPlayerSettings,
    successMessage: 'Font size updated successfully',
    errorMessage: 'Failed to update font size'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Font Size</p>
      <SliderInput
        min={0}
        max={90}
        step={1}
        showValue={true}
        unit='px'
        className="w-full"
        onBlur={(v) => onSubmit(v)}
        disabled={isLoading}
        value={Number(displayValue)}
      />
    </div>
  );
}