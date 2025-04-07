import { useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { invokeAnkiConnect } from "@/lib/anki"
import { ankiFieldsValues } from "@/lib/constants"

type FormState = {
    presetName: string
    deckName: string
    modelName: string
    fieldValues: Record<string, string>
    isDefault: boolean
    isGui: boolean
}

type PresetFormProps = {
    formState: FormState
    onChange: (newState: Partial<FormState>) => void
    onToggleDefault: (checked: boolean) => void
    onToggleGui: (checked: boolean) => void
}

export function PresetForm({ formState, onChange, onToggleDefault, onToggleGui }: PresetFormProps) {
    const { presetName, deckName, modelName, fieldValues, isDefault, isGui } = formState
    
    const { data: deckNames } = useQuery({
        queryKey: ['profile','settings','deckNames'],
        queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    })

    const { data: modelNames } = useQuery({
        queryKey: ['profile','settings','modelNames'],
        queryFn: async () => await invokeAnkiConnect('modelNames', 6),
    })

    const { data: modelFieldNames, refetch } = useQuery({
        queryKey: ['profile','settings','modelFieldNames', modelName],
        queryFn: async () => await invokeAnkiConnect('modelFieldNames', 6, { modelName }),
        enabled: !!modelName
    })

    useEffect(() => { 
        if (!modelName) return;
        refetch();
    }, [modelName, refetch])

    const handleFieldValue = (field: string, value: string) => {
        onChange({
            fieldValues: {
                ...fieldValues,
                [field]: value
            }
        });
    }

    if (!deckNames || !modelNames) {
        return (
            <CardContent className="flex items-center justify-center py-6">
                Loading deck and model data...
            </CardContent>
        );
    }

    return (
        <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="preset-name" className="col-span-3">Preset Name</Label>
                <Input 
                    id="preset-name"
                    className="col-span-5 w-full" 
                    placeholder="Enter preset name" 
                    value={presetName} 
                    onChange={(e) => onChange({ presetName: e.target.value })} 
                />
            </div>
            
            <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="deck-select" className="col-span-3">Deck</Label>
                <Select 
                    value={deckName} 
                    onValueChange={(deck) => onChange({ deckName: deck })}
                >
                    <SelectTrigger id="deck-select" className="col-span-5 w-full cursor-pointer">
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
            </div>
            
            <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="model-select" className="col-span-3">Model</Label>
                <Select 
                    value={modelName} 
                    onValueChange={(model) => {
                        onChange({ 
                            modelName: model,
                            fieldValues: {}
                        });
                    }}
                >
                    <SelectTrigger id="model-select" className="col-span-5 w-full cursor-pointer">
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
            </div>
            
            {modelFieldNames?.data && modelFieldNames.data.length > 0 && (
                <div className="pt-5">
                    <div className="grid grid-cols-8 gap-4 mb-2">
                        <div className="col-span-3 font-medium text-sm text-muted-foreground">Field</div>
                        <div className="col-span-5 font-medium text-sm text-muted-foreground">Value</div>
                    </div>
                    
                    {modelFieldNames.data.map((field: string, idx: number) => (
                        <div key={idx} className="grid grid-cols-8 gap-4 items-center mb-2">
                            <p className="col-span-3 text-sm">{field}</p>
                            <div className="col-span-5">
                                <Select 
                                    value={fieldValues[field] || ""} 
                                    onValueChange={(value) => handleFieldValue(field, value)}
                                >
                                    <SelectTrigger className="w-full cursor-pointer">
                                        <SelectValue placeholder="Select value" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ankiFieldsValues?.map((value, idx) => (
                                            <SelectItem key={idx} value={value}>
                                                &#123;{value}&#125;
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2 mt-2">
                    <Switch 
                        className="cursor-pointer"
                        checked={isDefault}
                        onCheckedChange={onToggleDefault}
                    />
                    <Label htmlFor="default-preset">Set as default preset</Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <Switch 
                        className="cursor-pointer"
                        checked={isGui}
                        onCheckedChange={onToggleGui}
                    />
                    <Label htmlFor="default-preset">Show the add card/note GUI instead of adding it directly</Label>
                </div>
            </div>
        </CardContent>
    )
}