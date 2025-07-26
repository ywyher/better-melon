'use client'

import { SliderInput } from "@/components/form/slider-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { SubtitleStylesControllerProps } from "@/types/subtitle";

export default function TextOpacityController({
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
    field: 'textOpacity',
    successMessage: 'Text opacity updated successfully',
    errorMessage: 'Failed to update text opacity'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Text Opacity</p>
      <SliderInput
        min={0}
        max={1}
        step={0.005}
        showValue={true}
        unit='percentage'
        className="w-full"
        onBlur={(v) => onSubmit(v)}
        disabled={isLoading}
        value={Number(displayValue)}
      />
    </div>
  );
}