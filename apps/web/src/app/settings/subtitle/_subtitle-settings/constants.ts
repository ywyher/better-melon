import { SubtitleSettings } from "@/lib/db/schema";

export const defaultSubtitleSettings: SubtitleSettings = {
    id: "",
    matchPattern: '',
    preferredFormat: 'srt',
    transcriptionOrder: ["hiragana","katakana","romaji","japanese","english"],
    definitionTrigger: 'click',
    showFurigana: true,
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
};