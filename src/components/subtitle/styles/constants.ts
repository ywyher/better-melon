import { SubtitleStyles } from "@/lib/db/schema";

export const defaultSubtitleStyles: SubtitleStyles = {
    id: '',
    fontSize: 35,
    fontFamily: "Arial",
    textShadow: 'outline' as SubtitleStyles['textShadow'],
    textColor: "#FFFFFF",
    textOpacity: 1,
    backgroundColor: "#000000",
    backgroundOpacity: .5,
    backgroundBlur: 0,
    backgroundRadius: 6,
    transcription: "all" as SubtitleStyles['transcription'],
    userId: '',
    createdAt: null,
    updatedAt: null
};