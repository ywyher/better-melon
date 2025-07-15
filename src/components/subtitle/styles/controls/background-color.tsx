'use client'

import { ColorInput } from "@/components/form/color-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { SubtitleStylesControllerProps } from "@/types/subtitle";

export default function BackgroundColorController({
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
    field: 'backgroundColor',
    successMessage: 'Background color updated successfully',
    errorMessage: 'Failed to update background color'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Background Color</p>
      <ColorInput
        onChange={(v) => onSubmit(v)}
        disabled={isLoading}
        value={String(displayValue)}
      />
    </div>
  );
}