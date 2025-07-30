import { UseFormReturn } from "react-hook-form"
import { FormField } from "@/components/form/form-field"
import { SwitchInput } from "@/components/form/switch-input"
import { AnkiPresetSchema } from "@/app/settings/anki/_components/types"

interface AnkiPresetSettingsProps {
  form: UseFormReturn<AnkiPresetSchema>
  isFirstPreset: boolean
}

export function AnkiPresetSettings({ form, isFirstPreset }: AnkiPresetSettingsProps) {
  return (
    <div className="space-y-3 pt-2">
      <FormField
        form={form}
        name="isDefault"
        label="Default Preset"
        description="Use this preset by default when creating new cards"
        containerClassName="rounded-lg border p-4"
        layout="flex"
        disabled={isFirstPreset}
      >
        <SwitchInput
          className="mt-2 md:mt-0"
        />
      </FormField>
      
      <FormField
        form={form}
        name="isGui"
        label="Show Anki GUI"
        description="Show the Anki add card/note GUI instead of adding it directly"
        containerClassName="rounded-lg border p-4"
        layout="flex"
      >
        <SwitchInput
          className="mt-2 md:mt-0"
          disabled={isFirstPreset}
        />
      </FormField>
    </div>
  )
}