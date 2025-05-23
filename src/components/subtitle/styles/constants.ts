import { SubtitleStyles } from "@/lib/db/schema";

export const defaultSubtitleStyles: {
    default: SubtitleStyles,
    active: SubtitleStyles
} = {
    default: {
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
        fontWeight: 'bold',
        margin: 0.5,
        userId: '',
        state: 'default',
        createdAt: null,
        updatedAt: null
    },
    active: {
        id: '',
        fontSize: 35,
        fontFamily: "Arial",
        textShadow: 'outline' as SubtitleStyles['textShadow'],
        textColor: "#4ade80",
        textOpacity: 1,
        backgroundColor: "#000000",
        backgroundOpacity: 0,
        backgroundBlur: 0,
        backgroundRadius: 6,
        transcription: "all" as SubtitleStyles['transcription'],
        fontWeight: 'bold',
        margin: 0.5,
        userId: '',
        state: 'active',
        createdAt: null,
        updatedAt: null
    }
};