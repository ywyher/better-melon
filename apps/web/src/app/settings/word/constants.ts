import { WordSettings } from "@/lib/db/schema";

export const defaultWordSettings: WordSettings =  {
    id: "",
    
    learningStatus: true,
    pitchColoring: true,

    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
}

export const wordStyles = {
    known: {
        color: ''
    }
}