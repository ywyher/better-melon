'use client'

import { SliderInput } from "@/components/form/slider-input";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { SubtitleStylesControllerProps } from "@/types/subtitle";

export default function GapController({
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
    field: 'gap',
    syncSettings,
    state,
    successMessage: 'Gap updated successfully',
    errorMessage: 'Failed to update gap'
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2 items-center">
        <p>Gap</p>
        <TooltipWrapper>
          {transcription == 'furigana' ? (
            <>Vertical space between the furigana and the japanese text</>
          ): (
            <>Left and right space between words</>
          )}
        </TooltipWrapper>
      </div>
      <SliderInput
        min={0}
        max={30}
        step={0.5}
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