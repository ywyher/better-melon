import { PlayerSettings } from "@/lib/db/schema";

export const defaultPlayerSettings: PlayerSettings =  {
    id: "",
    autoPlay: false,
    autoNext: false,
    autoSkip: false,
    enabledTranscriptions: ['japanese', 'english'],
    pauseOnCue: false,
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
}