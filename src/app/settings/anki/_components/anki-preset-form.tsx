import { Dispatch, SetStateAction, useEffect } from "react"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AnkiPreset } from "@/lib/db/schema"
import { FieldErrors } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { useIsSmall } from "@/lib/hooks/use-media-query"
import { toast } from "sonner"
import LoadingButton from "@/components/loading-button"
import AnkiDeletePreset from "@/app/settings/anki/_components/anki-delete-preset"
import { FormField } from "@/components/form/form-field"
import { SelectInput } from "@/components/form/select-input"
import AnkiPresetFormSkeleton from "@/app/settings/anki/_components/anki-skeleton"
import { useAnkiPresetForm } from "@/lib/hooks/use-anki-preset"
import { useAnkiData } from "@/lib/hooks/use-anki-preset-data"
import { AnkiFieldMappings } from "@/app/settings/anki/_components/anki-field-mapping"
import { AnkiPresetSettings } from "@/app/settings/anki/_components/anki-preset-settings"
import { AnkiPresetSchema } from "@/app/settings/anki/_components/types"

type PresetFormProps = {
  preset: AnkiPreset | null
  presets: AnkiPreset[]
  setSelectedPreset: Dispatch<SetStateAction<string>>
}

export default function AnkiPresetForm({ 
  preset,
  presets,
  setSelectedPreset
}: PresetFormProps) {
  const isSmall = useIsSmall()
  
  const {
    form,
    isLoading,
    selectedModel,
    setSelectedModel,
    isFirstPreset,
    onSubmit
  } = useAnkiPresetForm(preset, presets, setSelectedPreset)

  const {
    deckNames,
    modelNames,
    modelFieldNames,
    isModelFieldNamesLoading,
    isLoading: isDataLoading,
    hasData
  } = useAnkiData(selectedModel)

  useEffect(() => {
    if (modelFieldNames?.data && modelFieldNames.data.length > 0) {
      const fieldsObject = modelFieldNames.data.reduce((acc: Record<string, string | undefined>, fieldName: string) => {
        acc[fieldName] = preset?.fields?.[fieldName] || ""
        return acc
      }, {})
      
      form.setValue("fields", fieldsObject)
    }
  }, [modelFieldNames?.data, preset?.fields, form])

  const handleRemoveField = (fieldName: string) => {
    const currentFields = form.getValues().fields || {}
    const updatedFields = { ...currentFields }
    updatedFields[fieldName] = ""
    form.setValue("fields", updatedFields)
  }

  const onError = (errors: FieldErrors<AnkiPresetSchema>) => {
    const position = isSmall ? "top-center" : "bottom-right"
    const firstError = Object.values(errors)[0]

    if (firstError && 'message' in firstError && typeof firstError.message === 'string') {
      toast.error(firstError.message, { position })
    }
  }

  if (isDataLoading || !hasData) {
    return <AnkiPresetFormSkeleton />
  }

  return (
    <CardContent className="flex flex-col gap-4 py-3 px-6">
      <Form {...form}>
        <form className="flex flex-col space-y-6" onSubmit={form.handleSubmit(onSubmit, onError)}>
          <div className="space-y-4">
            <FormField form={form} label="Preset Name" name="name" layout="grid">
              <Input className="col-span-5 w-full" placeholder="Enter preset name" />
            </FormField>
            
            <FormField form={form} label="Deck" name="deck" layout="grid">
              <SelectInput 
                options={deckNames?.data.map((deck: string) => ({
                  label: deck,
                  value: deck
                }))}
              />
            </FormField>
            
            <FormField form={form} label="Model" name="model" layout="grid">
              <SelectInput
                onChange={setSelectedModel}
                options={modelNames?.data.map((model: string) => ({
                  label: model,
                  value: model
                }))}
              />
            </FormField>
          </div>

          {isModelFieldNamesLoading && (
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {modelFieldNames?.data && modelFieldNames.data.length > 0 && (
            <AnkiFieldMappings
              form={form}
              fieldNames={modelFieldNames.data}
              onRemoveField={handleRemoveField}
            />
          )}

          <AnkiPresetSettings form={form} isFirstPreset={isFirstPreset} />

          <LoadingButton isLoading={isLoading} className="w-full">
            {preset ? "Update Preset" : "Create Preset"}
          </LoadingButton>
        </form>
      </Form>
      
      {preset && (
        <AnkiDeletePreset
          presets={presets}
          presetId={preset.id}
          setSelectedPreset={setSelectedPreset}
        />
      )}
    </CardContent>
  )
}