import { SubtitleStyles } from "@/lib/db/schema";
import { SubtitleCue, SubtitleFormat, SubtitleTranscription } from "@/types/subtitle";
import { UseQueryResult } from "@tanstack/react-query";
import { CSSProperties } from "react";

export type TranscriptionQuery = {
  transcription: SubtitleTranscription;
  format: SubtitleFormat;
  cues: SubtitleCue[];
}

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
  containerStyle: CSSProperties;
};

export type TranscriptionStyles = { all: TranscriptionStyleSet } & Partial<Record<SubtitleTranscription, TranscriptionStyleSet>>;

export type StyleQuery = UseQueryResult<
  Partial<Record<SubtitleTranscription | 'all', SubtitleStyles | null>>,
  Error
>;