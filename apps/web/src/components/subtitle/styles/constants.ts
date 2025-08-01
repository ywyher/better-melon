import { StyleTranscription } from "@/app/watch/[id]/[ep]/types";
import { SubtitleStyles } from "@/lib/db/schema";

const DEFAULT_SETTINGS: {
    default: SubtitleStyles,
    active: SubtitleStyles
} = {
    default: {
        id: '',
        fontSize: 35,
        fontFamily: "Arial",
        textShadow: 'outline' as SubtitleStyles['textShadow'],
        textColor: "#fff",
        textOpacity: 1,
        backgroundColor: "#000",
        backgroundOpacity: 0.5,
        backgroundBlur: 0,
        backgroundRadius: 6,
        transcription: "all" as SubtitleStyles['transcription'],
        fontWeight: 'bold',
        margin: 3,
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
        margin: 3,
        userId: '',
        state: 'active',
        createdAt: null,
        updatedAt: null
    }
}

export const defaultSubtitleStyles: Record<StyleTranscription, {
    default: SubtitleStyles,
    active: SubtitleStyles
}> = {
    all: {
        default: DEFAULT_SETTINGS.default,
        active: DEFAULT_SETTINGS.active,
    },
    japanese: {
        default: DEFAULT_SETTINGS.default,
        active: DEFAULT_SETTINGS.active,
    },
    hiragana: {
        default: DEFAULT_SETTINGS.default,
        active: DEFAULT_SETTINGS.active,
    },
    katakana: {
        default: DEFAULT_SETTINGS.default,
        active: DEFAULT_SETTINGS.active,
    },
    romaji: {
        default: DEFAULT_SETTINGS.default,
        active: DEFAULT_SETTINGS.active,
    },
    english: {
        default: DEFAULT_SETTINGS.default,
        active: DEFAULT_SETTINGS.active,
    },
    furigana: {
        default: {
            ...DEFAULT_SETTINGS.default,
            fontSize: 25,
            margin: 15
        },
        active: {
            ...DEFAULT_SETTINGS.active,
            fontSize: 25,
            margin: 15
        },
    }
};