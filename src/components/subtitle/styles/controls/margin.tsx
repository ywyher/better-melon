'use client'

import { SliderInput } from "@/components/form/slider-input";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";

export default function MarginController({
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
    field: 'margin',
    syncPlayerSettings,
    state,
    successMessage: 'Margin updated successfully',
    errorMessage: 'Failed to update margin'
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2 items-center">
        <p>Margin</p>
        <TooltipWrapper>
          Left and right space between words
        </TooltipWrapper>
      </div>
      <SliderInput
        min={0}
        max={10}
        step={0.1}
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