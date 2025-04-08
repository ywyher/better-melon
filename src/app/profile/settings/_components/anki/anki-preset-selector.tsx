import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AnkiPreset } from "@/lib/stores/anki-presets-store"
import { Plus } from "lucide-react"

type PresetSelectorProps = {
    presets: AnkiPreset[]
    selectedPreset: string | null
    onPresetSelect: (presetId: string) => void
}

export default function AnkiPresetSelector({ presets, selectedPreset, onPresetSelect }: PresetSelectorProps) {
    return (
        <Select value={selectedPreset || "new"} onValueChange={onPresetSelect}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="new">
                    <div className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        New Preset
                    </div>
                </SelectItem>
                {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                        {preset.name} {preset.isDefault && "⭐"}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}