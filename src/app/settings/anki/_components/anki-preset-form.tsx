import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { invokeAnkiConnect } from "@/lib/anki"
import { AnkiPreset } from "@/lib/db/schema"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form"
import { useIsSmall } from "@/hooks/useMediaQuery"
import { toast } from "sonner"
import { ankiFieldsValues } from "@/lib/constants"
import { X } from "lucide-react"
import { createPreset, updatePreset } from "@/app/settings/anki/actions"
import { useRouter } from "next/navigation"
import LoadingButton from "@/components/loading-button"
import { Button } from "@/components/ui/button"
import AnkiSkeleton from "@/app/settings/anki/_components/anki-skeleton"
import AnkiDeletePreset from "@/app/settings/anki/_components/anki-delete-preset"

type PresetFormProps = {
    preset: AnkiPreset | null
    presets: AnkiPreset[];
    setSelectedPresetId: Dispatch<SetStateAction<AnkiPreset['id']>>
}

export const ankiPresetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    deck: z.string().min(1, "Deck is required"),
    model: z.string().min(1, "Model is required"),
    fields: z.record(z.string(), z.string().optional()).optional(), // Object with field names as keys and optional values
    isDefault: z.boolean(),
    isGui: z.boolean()
})

export type AnkiPresetSchema = z.infer<typeof ankiPresetSchema>

export default function AnkiPresetForm({ 
    preset,
    presets,
    setSelectedPresetId
}: PresetFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selectedModel, setSelectedModel] = useState<string>(preset?.model || "")

    const router = useRouter()
    const isSmall = useIsSmall()

    const queryClient = useQueryClient()
    const isFirstPreset = presets.length === 0

    const { data: deckNames, isLoading: isDeckNamesLoading } = useQuery({
        queryKey: ['profile', 'settings', 'deckNames'],
        queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    })

    const { data: modelNames, isLoading: isModelNamesLoading } = useQuery({
        queryKey: ['profile', 'settings', 'modelNames'],
        queryFn: async () => await invokeAnkiConnect('modelNames', 6),
    })

    const { data: modelFieldNames } = useQuery({
        queryKey: ['profile', 'settings', 'modelFieldNames', selectedModel],
        queryFn: async () => await invokeAnkiConnect('modelFieldNames', 6, { modelName: selectedModel }),
        enabled: !!selectedModel
    })

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

    useEffect(() => {
        if (preset) {
          // Set the selected model first so model fields can update properly
          setSelectedModel(preset.model || "");
          
          // Then reset the form with all values from the preset
          form.reset({
            name: preset.name || "",
            deck: preset.deck || "",
            model: preset.model || "",
            fields: preset.fields || {},
            isDefault: isFirstPreset ? true : preset.isDefault || false,
            isGui: preset.isGui || false,
          });
        } else {
          // Reset to default values when no preset is selected (new preset)
          setSelectedModel("");
          form.reset({
            name: "",
            deck: "",
            model: "",
            fields: {},
            isDefault: isFirstPreset ? true : false,
            isGui: false,
          });
        }
      }, [preset, form, isFirstPreset]);

    useEffect(() => {
        if (isFirstPreset) {
            form.setValue("isDefault", true);
        }
    }, [isFirstPreset, form]);

    // Update fields when model changes and field names are fetched
    useEffect(() => {
        if (modelFieldNames?.data && modelFieldNames.data.length > 0) {
            // Create a fields object from the existing preset fields or initialize new ones
            const fieldsObject = modelFieldNames.data.reduce((acc: Record<string, string | undefined>, fieldName: string) => {
                // Preserve existing values from preset or initialize to empty string
                acc[fieldName] = preset?.fields?.[fieldName] || "";
                return acc;
            }, {});
            
            // Update the form's fields value
            form.setValue("fields", fieldsObject);
        }
    }, [modelFieldNames?.data, preset?.fields, form]);

    const handleRemoveField = (fieldName: string) => {
        const currentFields = form.getValues().fields || {};
        const updatedFields = { ...currentFields };
        
        updatedFields[fieldName] = ""; 
        
        form.setValue("fields", updatedFields);
    };

    const onSubmit = async (data: AnkiPresetSchema) => {
        if(!data.fields || (Object.entries(data.fields).filter(([_, value]) => value).length == 0)) {
            toast.error("At least one field need to be mapped")
            return;
        };
        setIsLoading(true)
        let result;
        if(preset) {
            result = await updatePreset({ data, id: preset.id })
        }else {
            result = await createPreset({ data })
        }

        if(result.error) {
            toast.error(result.error)
            return;
        }

        const defaultPreset = presets.find(preset => preset.isDefault === true)
            
        setSelectedPresetId(defaultPreset?.id || "new")
        toast.message(result.message)
        setIsLoading(false)
        queryClient.invalidateQueries({ queryKey: [ 'anki' ] })
    }

    const onError = (errors: FieldErrors<AnkiPresetSchema>) => {
        const position = isSmall ? "top-center" : "bottom-right"
        const firstError = Object.values(errors)[0];
    
        if (firstError && 'message' in firstError && typeof firstError.message === 'string') {
            toast.error(firstError.message, { position });
        }
    }
    
    if (!deckNames || !modelNames || isDeckNamesLoading || isModelNamesLoading) {
        return <AnkiSkeleton />
    }

    return (
        <CardContent className="flex flex-col gap-4 py-3 px-6">
            <Form {...form}>
                <form className="flex flex-col space-y-6" onSubmit={form.handleSubmit(onSubmit, onError)}>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-8 items-center gap-4">
                                    <FormLabel className="col-span-3 text-sm font-medium">Preset Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="col-span-5 w-full" 
                                            placeholder="Enter preset name"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="deck"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-8 items-center gap-4">
                                    <FormLabel className="col-span-3 text-sm font-medium">Deck</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="col-span-5 w-full cursor-pointer">
                                                <SelectValue placeholder="Select deck" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {deckNames.data?.map((deck: string, idx: number) => (
                                                    <SelectItem key={idx} value={deck}>
                                                        {deck}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-8 items-center gap-4">
                                    <FormLabel className="col-span-3 text-sm font-medium">Model</FormLabel>
                                    <FormControl>
                                        <Select 
                                            value={field.value} 
                                            onValueChange={(e) => {
                                                field.onChange(e)
                                                setSelectedModel(e)
                                            }}
                                        >
                                            <SelectTrigger className="col-span-5 w-full cursor-pointer">
                                                <SelectValue placeholder="Select model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {modelNames.data?.map((model: string, idx: number) => (
                                                    <SelectItem key={idx} value={model}>
                                                        {model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    {modelFieldNames?.data && modelFieldNames.data.length > 0 && (
                        <div className="bg-muted/20 rounded-lg p-4 border border-border">
                            <h3 className="text-sm font-medium mb-4">Field Mappings</h3>
                            <div className="grid grid-cols-8 gap-4 mb-2 border-b pb-2">
                                <div className="col-span-3 font-medium text-sm text-muted-foreground">Anki Field</div>
                                <div className="col-span-5 font-medium text-sm text-muted-foreground">Maps To</div>
                            </div>
                            
                            <div className="space-y-3">
                                {modelFieldNames.data.map((fieldName: string) => (
                                    <div key={fieldName} className="grid grid-cols-8 gap-4 items-center">
                                        <div className="col-span-3 text-sm font-medium">{fieldName}</div>
                                        <div className="col-span-5 flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`fields.${fieldName}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <div className="flex gap-2 items-center">
                                                                <Select 
                                                                    value={field.value || ""} 
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="w-full cursor-pointer">
                                                                        <SelectValue placeholder="Select value" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {ankiFieldsValues.map((value) => (
                                                                            <SelectItem key={value} value={value}>
                                                                                &#123;{value}&#125;
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {field.value && (
                                                                    <Button
                                                                        type="button" 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => handleRemoveField(fieldName)}
                                                                    >
                                                                        <X size={16} />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="space-y-3 pt-2">
                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Default Preset</FormLabel>
                                        <FormDescription>
                                            Use this preset by default when creating new cards
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch 
                                            className="cursor-pointer"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isFirstPreset}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isGui"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Show Anki GUI</FormLabel>
                                        <FormDescription>
                                            Show the Anki add card/note GUI instead of adding directly
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch 
                                            className="cursor-pointer"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <LoadingButton isLoading={isLoading} className="w-full">
                        {preset ? "Update Preset" : "Create Preset"}
                    </LoadingButton>
                </form>
            </Form>
            {preset && (
                <AnkiDeletePreset
                    presets={presets}
                    presetId={preset.id}
                    setSelectedPresetId={setSelectedPresetId}
                />
            )}
        </CardContent>
    )
}