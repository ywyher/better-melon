"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Save, Trash2 } from "lucide-react"
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { PresetSelector } from "@/app/profile/settings/_components/anki/preset-selector"
import { PresetForm } from "@/app/profile/settings/_components/anki/preset-form"
import { AnkiField, AnkiPreset as TAnkiPreset, useAnkiPresetStore } from "@/lib/stores/anki-presets-store"
import { nanoid } from 'nanoid'

export default function AnkiPreset() {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [formState, setFormState] = useState({
        presetName: "",
        deckName: "",
        modelName: "",
        fieldValues: {} as Record<string, string>,
        isDefault: false,
        isGui: false
    })
    
    const { presets, addPreset, updatePreset, deletePreset, setDefaultPreset, getDefaultPreset } = useAnkiPresetStore()
    
    useEffect(() => {
        const defaultPreset = getDefaultPreset();
        if (defaultPreset) {
            loadPreset(defaultPreset);
            setSelectedPreset(defaultPreset.id);
        }
    }, [getDefaultPreset]);

    const loadPreset = (preset: TAnkiPreset) => {
        setFormState({
            presetName: preset.name,
            deckName: preset.deckName,
            modelName: preset.modelName,
            isDefault: preset.isDefault,
            isGui: preset.isGui,
            fieldValues: preset.fields.reduce((acc: Record<string, string>, field: AnkiField) => {
                acc[field.name] = field.value;
                return acc;
            }, {})
        });
    }
    
    const handlePresetSelect = (presetId: string) => {
        if (presetId === "new") {
            setFormState({
                presetName: "",
                deckName: "",
                modelName: "",
                fieldValues: {},
                isDefault: false,
                isGui: false,
            });
            setSelectedPreset(null);
            return;
        }
        
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            loadPreset(preset);
            setSelectedPreset(presetId);
        }
    }
    
    const handleFormChange = (newState: Partial<typeof formState>) => {
        setFormState(prev => ({
            ...prev,
            ...newState
        }));
    }
    
    const handleToggleDefault = (checked: boolean) => {
        setFormState(prev => ({
            ...prev,
            isDefault: checked
        }));
        
        if (checked && selectedPreset) {
            setDefaultPreset(selectedPreset);
        }
    }

    const handleToggleGui = (checked: boolean) => {
        setFormState(prev => ({
            ...prev,
            isGui: checked
        }));
    }
    
    const savePreset = () => {
        const { presetName, deckName, modelName, fieldValues, isDefault, isGui } = formState;
        
        if (!deckName || !modelName || !presetName) {
            toast.error("Please fill in deck name, model name, and preset name");
            return;
        }
        
        const fields = Object.entries(fieldValues).map(([name, value]) => ({
            name,
            value
        })) as AnkiField[];
        
        const preset = {
            id: nanoid(),
            name: presetName,
            deckName,
            modelName,
            fields,
            isDefault,
            isGui
        };
        
        addPreset(preset);
        setSelectedPreset(preset.id)
        toast.success("Preset saved successfully!");
    }
    
    const updateCurrentPreset = () => {
        if (!selectedPreset) return;
        
        const { presetName, deckName, modelName, fieldValues, isDefault, isGui } = formState;
        
        if (!deckName || !modelName || !presetName) {
            toast.error("Please fill in deck name, model name, and preset name");
            return;
        }
        
        const fields = Object.entries(fieldValues).map(([name, value]) => ({
            name,
            value
        })) as AnkiField[];
        
        updatePreset(selectedPreset, {
            name: presetName,
            deckName,
            modelName,
            fields,
            isDefault,
            isGui
        });
        
        toast.success("Preset updated successfully!");
    }
    
    const confirmDeletePreset = () => {
        setIsDeleteDialogOpen(true);
    }
    
    const handleDeletePreset = () => {
        if (!selectedPreset) return;
        
        deletePreset(selectedPreset);
        setIsDeleteDialogOpen(false);
        
        setFormState({
            presetName: "",
            deckName: "",
            modelName: "",
            fieldValues: {},
            isDefault: false,
            isGui: false
        });
        setSelectedPreset(null);
        
        const defaultPreset = getDefaultPreset();
        if (defaultPreset) {
            loadPreset(defaultPreset);
            setSelectedPreset(defaultPreset.id);
        }
        
        toast.success("Preset deleted successfully!");
    }

    return (
        <>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Anki Preset</CardTitle>
                    <PresetSelector 
                        presets={presets} 
                        selectedPreset={selectedPreset} 
                        onPresetSelect={handlePresetSelect} 
                    />
                </CardHeader>
                
                <PresetForm
                    formState={formState}
                    onChange={handleFormChange}
                    onToggleDefault={handleToggleDefault}
                    onToggleGui={handleToggleGui}
                />
                
                <CardFooter className="flex justify-between pt-6 gap-4">
                    <div>
                        {selectedPreset && (
                            <Button variant="destructive" onClick={confirmDeletePreset}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Preset
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {selectedPreset ? (
                            <Button onClick={updateCurrentPreset}>
                                <Save className="mr-2 h-4 w-4" />
                                Update Preset
                            </Button>
                        ) : (
                            <Button onClick={savePreset}>
                                <Plus className="mr-2 h-4 w-4" />
                                Save New Preset
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this preset.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePreset}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}