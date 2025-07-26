'use client'

import { ColorInput } from "@/components/form/color-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { SubtitleStylesControllerProps } from "@/types/subtitle";

export default function TextColorController({
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
    field: 'textColor',
    successMessage: 'Text color updated successfully',
    errorMessage: 'Failed to update text color'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Text Color</p>
      <ColorInput
        onBlur={(v) => onSubmit(v.currentTarget.value)}
        disabled={isLoading}
        value={String(displayValue)}
      />
    </div>
  );
}