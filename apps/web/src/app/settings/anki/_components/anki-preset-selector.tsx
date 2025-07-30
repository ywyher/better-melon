import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AnkiPreset } from "@/lib/db/schema"
import { Plus } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

type PresetSelectorProps = {
    presets: AnkiPreset[]
    selectedPreset: string | null
    setSelectedPreset: Dispatch<SetStateAction<string>>
}

export default function AnkiPresetSelector({ presets, selectedPreset, setSelectedPreset }: PresetSelectorProps) {
    return (
        <Select value={selectedPreset || "new"} onValueChange={setSelectedPreset}>
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