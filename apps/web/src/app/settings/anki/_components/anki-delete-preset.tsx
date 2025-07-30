"use client"

import { AnkiPreset } from "@/lib/db/schema";
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CardFooter } from "@/components/ui/card"
import { useQueryClient } from "@tanstack/react-query"
import { deletePreset } from "@/app/settings/anki/actions"
import LoadingButton from "@/components/loading-button"
import { Dispatch, SetStateAction, useState } from "react";
import { ankiQueries } from "@/lib/queries/anki";

type AnkiDeletePresetProps = {
    presets: AnkiPreset[];
    presetId: AnkiPreset['id']
    setSelectedPreset: Dispatch<SetStateAction<string>>
}

export default function AnkiDeletePreset({ 
    presets,
    presetId,
    setSelectedPreset
}: AnkiDeletePresetProps ) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const queryClient = useQueryClient()


    const handleDeletePreset = async () => {
        setIsLoading(true)
        
        if (!presetId || presetId === "new") {
            toast.error("No preset selected to delete")
            setIsLoading(false)
            return
        }
        
        const { message, error } = await deletePreset({ id: presetId })
        
        if (error) {
            toast.error(error)
            setIsLoading(false)
            return
        }
        
        toast.success(message)
        
        queryClient.invalidateQueries({ queryKey: ankiQueries.presets._def })
        
        const defaultPreset = presets?.find(preset => preset.isDefault === true)

        setSelectedPreset(defaultPreset?.id || 'new')
        setIsLoading(false)
        setIsDeleteDialogOpen(false)
    }

    return (
        <>
            <CardFooter className="p-0">
                {presetId !== "new" && (
                    <LoadingButton type="button" isLoading={isLoading} variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Preset
                    </LoadingButton>
                )}
            </CardFooter>
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