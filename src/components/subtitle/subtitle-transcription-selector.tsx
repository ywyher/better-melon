import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { SubtitleStyles } from "@/lib/db/schema"
import { Plus } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

type SubtitleTranscriptionSelectorProps = {
    selectedTranscription: SubtitleStyles['transcription'] | null
    setSelectedTranscription: Dispatch<SetStateAction<SubtitleStyles['transcription']>>
}

export default function SubtitleTranscriptionSelector({ selectedTranscription, setSelectedTranscription }: SubtitleTranscriptionSelectorProps) {

    const transcriptions = [
        'all',
        ...subtitleTranscriptions,
    ]

    return (
        <Select value={selectedTranscription || "all"} onValueChange={(v: SubtitleStyles['transcription']) => setSelectedTranscription(v)}>
            <SelectTrigger className="w-[200px] capitalize cursor-pointer">
                <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="new">
                    <div className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        New Preset
                    </div>
                </SelectItem>
                {transcriptions.map((transcription, idx) => (
                    <SelectItem className="capitalize" key={idx} value={transcription}>
                        {transcription}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}