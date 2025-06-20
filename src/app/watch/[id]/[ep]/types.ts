import { SubtitleStyles, Word } from "@/lib/db/schema";
import { NHKEntry } from "@/types/nhk";
import { SubtitleCue, SubtitleFormat, SubtitleTranscription } from "@/types/subtitle";
import { UseQueryResult } from "@tanstack/react-query";
import { CSSProperties } from "react";

export type Subtitle = Record<SubtitleTranscription, SubtitleCue[]>

export type TranscriptionQuery = {
  transcription: SubtitleTranscription;
  format: SubtitleFormat;
  cues: SubtitleCue[];
}

export type TranscriptionsLookup = Map<SubtitleTranscription, Map<string, SubtitleCue>>
export type WordsLookup = Map<string, Word>
export type PitchLookup = Map<string, NHKEntry>

export type SubtitleQuery = UseQueryResult<{
    transcription: SubtitleTranscription;
    format: SubtitleFormat;
    cues: SubtitleCue[];
}, Error>;

export type TranscriptionStyleSet = {
  tokenStyles: {
    default: CSSProperties;
    active: CSSProperties;
  };
  containerStyle: {
    default: CSSProperties;
    active: CSSProperties;
  };
};

export type TranscriptionStyles = { all: TranscriptionStyleSet } & Partial<Record<SubtitleTranscription, TranscriptionStyleSet>>;

export type StyleQuery = UseQueryResult<
  Partial<Record<SubtitleTranscription | 'all', SubtitleStyles | null>>,
  Error
>;