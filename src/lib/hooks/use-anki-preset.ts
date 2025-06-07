import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AnkiPreset } from "@/lib/db/schema"
import { ankiQueries } from "@/lib/queries/anki"
import { userQueries } from "@/lib/queries/user"
import { createPreset, updatePreset } from "@/app/settings/anki/actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { ankiPresetSchema, AnkiPresetSchema } from "@/app/settings/anki/_components/types"

export function useAnkiPresetForm(
  preset: AnkiPreset | null,
  presets: AnkiPreset[],
  setSelectedPreset: (id: string) => void
) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(preset?.model || "")
  const queryClient = useQueryClient()
  const isFirstPreset = presets.length === 0

  const form = useForm<AnkiPresetSchema>({
    resolver: zodResolver(ankiPresetSchema),
    defaultValues: {
      name: preset?.name || "",
      deck: preset?.deck || "",
      model: preset?.model || "",
      fields: preset?.fields || {},
      isDefault: isFirstPreset ? true : preset?.isDefault || false,
      isGui: preset?.isGui || false,
    }
  })

  // Reset form when preset changes
  useEffect(() => {
    if (preset) {
      setSelectedModel(preset.model || "")
      form.reset({
        name: preset.name || "",
        deck: preset.deck || "",
        model: preset.model || "",
        fields: preset.fields || {},
        isDefault: isFirstPreset ? true : preset.isDefault || false,
        isGui: preset.isGui || false,
      })
    } else {
      setSelectedModel("")
      form.reset({
        name: "",
        deck: "",
        model: "",
        fields: {},
        isDefault: isFirstPreset ? true : false,
        isGui: false,
      })
    }
  }, [preset, form, isFirstPreset])

  // Ensure first preset is always default
  useEffect(() => {
    if (isFirstPreset) {
      form.setValue("isDefault", true)
    }
  }, [isFirstPreset, form])

  const onSubmit = async (data: AnkiPresetSchema) => {
    if (!data.fields || Object.entries(data.fields).filter(([, value]) => value).length === 0) {
      toast.error("At least one field needs to be mapped")
      return
    }

    setIsLoading(true)
    
    try {
      const result = preset 
        ? await updatePreset({ data, id: preset.id })
        : await createPreset({ data })

      if (result.error) {
        toast.error(result.error)
        return
      }

      const defaultPreset = presets.find(p => p.isDefault === true)
      
      queryClient.invalidateQueries({ queryKey: userQueries.session._def })
      queryClient.invalidateQueries({ queryKey: ankiQueries._def })
      setSelectedPreset(defaultPreset?.id || "new")
      toast.success(result.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    isLoading,
    selectedModel,
    setSelectedModel,
    isFirstPreset,
    onSubmit
  }
}
