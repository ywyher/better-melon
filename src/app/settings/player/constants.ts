import { PlayerSettings } from "@/lib/db/schema";

export const defaultPlayerSettings: PlayerSettings =  {
    id: "",
    
    autoPlay: false,
    autoNext: false,
    autoSkip: false,

    enabledTranscriptions: ['japanese', 'hiragana', 'english'],

    pauseOnCue: false,
    cuePauseDuration: null,

    autoScrollToCue: true,
    autoScrollResumeDelay: 3,

    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
}