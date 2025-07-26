import type { NHKEntry, OriginalNHKEntry } from "../types/nhk";

export const editNHKStructure = (data: OriginalNHKEntry[]): NHKEntry[] => {
  return data.map((entry) => {
    const [word, type, details] = entry;
    
    return {
      word,
      type,
      reading: details.reading,
      pitches: details.pitches
    };
  });
};