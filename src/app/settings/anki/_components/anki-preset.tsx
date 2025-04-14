"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import AnkiPresetForm from "@/app/settings/anki/_components/anki-preset-form"
import { useQuery } from "@tanstack/react-query"
import { getPreset, getPresets } from "@/app/settings/anki/actions"
import AnkiSkeleton from "@/app/settings/anki/_components/anki-skeleton"
import { AnkiPreset as TAnkiPreset } from "@/lib/db/schema"
import AnkiPresetSelector from "@/app/settings/anki/_components/anki-preset-selector"


export default function AnkiPreset() {
    const [selectedPresetId, setSelectedPresetId] = useState<string>("new")

    const { data: presets, isLoading: isPresetsLoading } = useQuery({
        queryKey: ['anki', 'presets'],
        queryFn: async () => {
            const presets = await getPresets() || []
            return presets as TAnkiPreset[]
        }
    })
    
    const { data: selectedPreset, isLoading: isSelectedPresetLoading } = useQuery({
        queryKey: ['anki', 'preset', selectedPresetId],
        queryFn: async () => {
            if(!selectedPresetId || selectedPresetId === "new") return null;
            
            const preset = await getPreset({ id: selectedPresetId })
            return preset as TAnkiPreset
        },
        enabled: !!selectedPresetId && selectedPresetId !== "new"
    })

    useEffect(() => {
        if (presets && presets.length > 0) {
            const defaultPreset = presets.find(preset => preset.isDefault === true)
            
            setSelectedPresetId(defaultPreset?.id || "new")
        }
    }, [presets])
    

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
                        presets={presets}
                        setSelectedPresetId={setSelectedPresetId}
                    />
                ): (
                    <AnkiSkeleton />
                )}
            </Card>
        </>
    )
}