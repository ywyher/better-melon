import { SubtitleCue } from "@/types/subtitle";
import { Tokenizer } from "kuromojin";

export const tokenizerStats = {
  tokenizationInProgress: new Map<string, Promise<SubtitleCue[]>>(),
  tokenizer: null as Tokenizer | null,
  tokenizerInitPromise: null as Promise<Tokenizer> | null
};