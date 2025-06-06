import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FormField } from "@/components/form/form-field"
import { SelectInput } from "@/components/form/select-input"
import { ankiFieldsValues } from "@/lib/constants/anki"
import { AnkiPresetSchema } from "@/app/settings/anki/_components/types"

interface AnkiFieldMappingsProps {
  form: UseFormReturn<AnkiPresetSchema>
  fieldNames: string[]
  onRemoveField: (fieldName: string) => void
}

export function AnkiFieldMappings({ form, fieldNames, onRemoveField }: AnkiFieldMappingsProps) {
  return (
    <div className="bg-muted/20 rounded-lg p-4 border border-border">
      <h3 className="text-sm font-medium mb-4">Field Mappings</h3>
      <div className="grid grid-cols-8 gap-4 mb-2 border-b pb-2">
        <div className="col-span-3 font-medium text-sm text-muted-foreground">Anki Field</div>
        <div className="col-span-5 font-medium text-sm text-muted-foreground">Maps To</div>
      </div>
      
      <div className="space-y-3">
        {fieldNames.map((fieldName) => (
          <div key={fieldName} className="grid grid-cols-8 gap-4 items-center">
            <div className="col-span-3 text-sm font-medium">{fieldName}</div>
            <div className="col-span-5 flex items-center gap-2">
              <FormField form={form} name={`fields.${fieldName}`}>
                <SelectInput 
                  options={ankiFieldsValues.map((value) => ({ 
                    value: value, 
                    label: `{${value}}` 
                  }))}
                />
              </FormField>
              {form.getValues(`fields.${fieldName}`) && (
                <Button
                  type="button" 
                  variant="ghost"
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveField(fieldName)}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}