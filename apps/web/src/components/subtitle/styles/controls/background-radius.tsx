'use client'

import { SliderInput } from "@/components/form/slider-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { SubtitleStylesControllerProps } from "@/types/subtitle";

export default function BackgroundRadiusController({
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
    field: 'backgroundRadius',
    successMessage: 'Background radius updated successfully',
    errorMessage: 'Failed to update background radius'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Background Radius</p>
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