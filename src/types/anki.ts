import { ankiFieldsValues } from "@/lib/constants/anki";

export type AnkiFieldKey = typeof ankiFieldsValues[number];

export type AnkiNote = {
  noteId: number;
  profile: string;
  cards: string[];
  fields: Record<string, { value: string; order: number }>;
  modelName: string;
  mod: number
  tags: [],
}