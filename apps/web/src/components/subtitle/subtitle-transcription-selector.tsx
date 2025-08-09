import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { subtitleTranscriptions } from "@/lib/constants/subtitle";
import { SubtitleStyles } from "@/lib/db/schema"
import { Dispatch, SetStateAction } from "react"

type SubtitleTranscriptionSelectorProps = {
    selectedTranscription: SubtitleStyles['transcription'] | null
    setSelectedTranscription: Dispatch<SetStateAction<SubtitleStyles['transcription']>>
    setSelectedState: Dispatch<SetStateAction<SubtitleStyles['state']>>
}

export default function SubtitleTranscriptionSelector({ 
  selectedTranscription, 
  setSelectedTranscription,
  setSelectedState
}: SubtitleTranscriptionSelectorProps) {

    const transcriptions = [
        'all',
        ...subtitleTranscriptions,
        'furigana'
    ]

    const onChange = (v: SubtitleStyles['transcription']) => {
        setSelectedTranscription(v)
        setSelectedState('default')
    }

    return (
        <Select 
            value={selectedTranscription || "all"} 
            onValueChange={(v: SubtitleStyles['transcription']) => onChange(v)}
        >
            <SelectTrigger className="w-full lg:w-[200px] capitalize cursor-pointer">
                <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
                {transcriptions.map((transcription, idx) => (
                    <SelectItem className="capitalize" key={idx} value={transcription}>
                        {transcription}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}