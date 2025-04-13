"use client"

import { useEffect, useState } from "react"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AnkiPresetForm from "@/app/settings/anki/_components/anki-preset-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { deletePreset, getPreset, getPresets } from "@/app/settings/anki/actions"
import AnkiSkeleton from "@/app/settings/anki/_components/anki-skeleton"
import { AnkiPreset as TAnkiPreset } from "@/lib/db/schema"
import AnkiPresetSelector from "@/app/settings/anki/_components/anki-preset-selector"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import LoadingButton from "@/components/loading-button"

export default function AnkiPreset() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selectedPresetId, setSelectedPresetId] = useState<string>("new")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: presets, isLoading: isPresetsLoading } = useQuery({
        queryKey: ['anki', 'presets'],
        queryFn: async () => {
            const presets = await getPresets() || []
            return presets as TAnkiPreset[]
        }
    })
    
    useEffect(() => {
        if (presets && presets.length > 0) {
            const defaultPreset = presets.find(preset => preset.isDefault === true)
            
            if (defaultPreset) {
                setSelectedPresetId(defaultPreset.id)
            }
        }
    }, [presets])
    
    const { data: selectedPreset, isLoading: isSelectedPresetLoading } = useQuery({
        queryKey: ['anki', 'preset', selectedPresetId],
        queryFn: async () => {
            if(!selectedPresetId || selectedPresetId === "new") return null;
            
            const preset = await getPreset({ id: selectedPresetId })
            return preset as TAnkiPreset
        },
        enabled: !!selectedPresetId && selectedPresetId !== "new"
    })

    const handleDeletePreset = async () => {
        setIsLoading(true)
        
        if (!selectedPresetId || selectedPresetId === "new") {
            toast.error("No preset selected to delete")
            setIsLoading(false)
            return
        }
        
        const { message, error } = await deletePreset({ id: selectedPresetId })
        
        if (error) {
            toast.error(error)
            setIsLoading(false)
            return
        }
        
        toast.success(message)
        
        queryClient.invalidateQueries({ queryKey: ['anki', 'presets'] })
        
        const defaultPreset = presets?.find(preset => preset.isDefault === true)

        setSelectedPresetId(defaultPreset?.id || 'new')
        setIsLoading(false)
        setIsDeleteDialogOpen(false)
    }

    if(!presets || isPresetsLoading) return <AnkiSkeleton />;

    return (
        <>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        {selectedPresetId === "new" ? "Create New Preset" : "Edit Preset"}
                    </CardTitle>
                    <AnkiPresetSelector 
                        presets={presets} 
                        selectedPresetId={selectedPresetId}
                        setSelectedPresetId={setSelectedPresetId}
                    />
                </CardHeader>
                
                {!isSelectedPresetLoading ? (
                    <AnkiPresetForm
                        preset={selectedPresetId === "new" ? null : selectedPreset || null}
                        presetsLength={presets.length}
                    />
                ): (
                    <AnkiSkeleton />
                )}
                
                <CardFooter className="flex justify-between gap-4">
                    {selectedPreset && selectedPresetId !== "new" && (
                        <LoadingButton isLoading={isLoading} variant="destructive" onClick={handleDeletePreset}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Preset
                        </LoadingButton>
                    )}
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