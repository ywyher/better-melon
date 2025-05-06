import { SubtitleCue, SubtitleFormat, SubtitleTranscription } from "@/types/subtitle";
import { UseQueryResult } from "@tanstack/react-query";

export type SubtitleQuery = UseQueryResult<{
    transcription: SubtitleTranscription;
    format: SubtitleFormat;
    cues: SubtitleCue[];
}, Error>;
