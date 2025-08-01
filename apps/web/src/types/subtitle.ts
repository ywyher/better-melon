import { GeneralSettings, SubtitleStyles } from "@/lib/db/schema";

export type Ruby = {
  kanji: string;
  furigana: string;
}

export type SubtitleEntry = {
  id: number;
  name: string;
  flags: {
    anime: boolean;
    unverified: boolean;
    external: boolean;
    movie: boolean;
    adult: boolean;
  };
  last_modified: string | Date;
  anilist_id: number;
  english_name: string;
  japanese_name: string;
}

export type SubtitleFile = {
  url: string;
  name: string;
  size: number;
  last_modified: Date | string;
}

export type ActiveSubtitleFile = 
  | { source: "remote"; file: SubtitleFile }
  | { source: "local"; file: File };

export type SubtitleToken = {
    // Most used
    id: string;
    word_id: number;
    surface_form: string; // most important
    original_form: string; // preserve original form before converting using kuroshiro
    pos: string;
    basic_form: string;
    reading?: string | undefined;
    pronunciation?: string | undefined;

    // Extras
    word_type: string;
    word_position: number;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
}

export type SubtitleCue = {
  id: number;
  from: number;
  to: number;
  transcription: SubtitleTranscription;
  content: string;
  tokens?: SubtitleToken[];
}

export type SubtitleFormat = 'srt' | 'vtt' | 'ass'
export type SubtitleTranscription = "japanese" | "hiragana" | "katakana" | "romaji" | "english"

export type SubtitleDelay = {
  japanese: number,
  english: number
}

export type SubtitleStylesControllerProps = { 
  value: string | number
  transcription: SubtitleStyles['transcription'] 
  source: 'store' | 'database'
  syncSettings: GeneralSettings['syncSettings']
  state: SubtitleStyles['state']
}

export interface ParseSubtitleBody {
  source: string;
  isFile: boolean;
  fileContent?: string;
  lastModified?: number;
}

export interface SubtitleCache {
  content: string;
  // Japanese/English only
  parsedSubtitles: SubtitleCue[];
  // Japanese/English only
  // YOU DUMB FUCK, JAPANESE AND ENGLISH DOESN'T SHARE THE SAME FILE NOR CACHE KEY
  tokenizedSubtitles: SubtitleCue[];
  convertedSubtitles?: Partial<Record<Exclude<SubtitleTranscription, 'english'>, SubtitleCue[]>>
  lastAccessed: number;
}

export type CachedFiles = {
  japanese: string | null;
  english: string | null;
}