import { SubtitleSettings } from "@/lib/db/schema";

export const defaultSubtitleSettings = {
    fontSize: 16,
    fontFamily: "Arial",
    textShadow: 'outline' as SubtitleSettings['textShadow'],
    textColor: "#FFFFFF",
    textOpacity: 1,
    backgroundColor: "#000000",
    backgroundOpacity: 0,
    backgroundBlur: 0,
    backgroundRadius: 6,
    transcription: "all" as SubtitleSettings['transcription'],
};