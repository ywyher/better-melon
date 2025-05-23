'use client'

import { SliderInput } from "@/components/form/slider-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";

export default function BackgroundBlurController({
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
    field: 'backgroundBlur',
    successMessage: 'Background Blur updated successfully',
    errorMessage: 'Failed to update background Blur'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Background Blur</p>
      <SliderInput
        min={0}
        max={30}
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