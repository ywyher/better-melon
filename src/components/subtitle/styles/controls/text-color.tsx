'use client'

import { ColorInput } from "@/components/form/color-input";
import { useStyleFieldController } from "@/lib/hooks/use-style-field-controller";
import { FieldControllerProps } from "@/types/subtitle";

export default function TextShadowController({
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
    field: 'textColor',
    successMessage: 'Text color updated successfully',
    errorMessage: 'Failed to update text color'
  });

  return (
    <div className="flex flex-col gap-1">
      <p>Text Color</p>
      <ColorInput
        onChange={(v) => onSubmit(v)}
        disabled={isLoading}
        value={String(displayValue)}
      />
    </div>
  );
}