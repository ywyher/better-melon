"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import AnkiPresetForm from "@/app/settings/anki/_components/anki-preset-form"
import { useQuery } from "@tanstack/react-query"
import AnkiSkeleton from "@/app/settings/anki/_components/anki-skeleton"
import AnkiPresetSelector from "@/app/settings/anki/_components/anki-preset-selector"
import { ankiQueries } from "@/lib/queries/anki"

export default function AnkiPreset() {
    const [selectedPreset, setSelectedPreset] = useState<string>("new")

    const { data: presets, isLoading: isPresetsLoading } = useQuery({ ...ankiQueries.presets() })
    
    const { data: presetData, isLoading: isPresetDataLoading } = useQuery({
        ...ankiQueries.preset(selectedPreset),
        enabled: !!selectedPreset && selectedPreset !== "new"
    })

    useEffect(() => {
        if (presets && presets.length > 0) {
            const defaultPreset = presets.find(preset => preset.isDefault === true)
            setSelectedPreset(defaultPreset?.id || "new")
        }
    }, [presets])
    

    if(!presets || isPresetsLoading) return <AnkiSkeleton />;

    return (
        <>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        {selectedPreset === "new" ? "Create New Preset" : "Edit Preset"}
                    </CardTitle>
                    <AnkiPresetSelector 
                        presets={presets} 
                        selectedPreset={selectedPreset}
                        setSelectedPreset={setSelectedPreset}
                    />
                </CardHeader>
                
                {!isPresetDataLoading ? (
                    <AnkiPresetForm
                        preset={selectedPreset === "new" ? null : presetData || null}
                        presets={presets}
                        setSelectedPreset={setSelectedPreset}
                    />
                ): (
                    <AnkiSkeleton />
                )}
            </Card>
        </>
    )
}