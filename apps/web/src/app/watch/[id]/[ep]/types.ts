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
export type WordsLookup = Map<string, { word: Word['word'], status: Word['status'] }>
export type PitchLookup = Map<string, NHKEntry>

export type SubtitleQuery = UseQueryResult<{
    transcription: SubtitleTranscription;
    format: SubtitleFormat;
    cues: SubtitleCue[];
}, Error>;

export type StyleTranscription = SubtitleTranscription | 'furigana' | "all"

export type StyleSet<T> = {
  default: T;
  active: T;
};

export type TranscriptionStylesSet = {
  token: StyleSet<CSSProperties>
  container: StyleSet<CSSProperties>
};

export type TranscriptionStyles = { all: TranscriptionStylesSet } & Partial<Record<StyleTranscription, TranscriptionStylesSet>>;

export type StyleQuery = UseQueryResult<
  Partial<Record<SubtitleTranscription | 'all', SubtitleStyles | null>>,
  Error
>;