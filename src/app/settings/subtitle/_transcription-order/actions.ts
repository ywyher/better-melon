'use server'

import { ensureSubtitleSettingsExists } from "@/app/settings/subtitle/_subtitle-settings/actions"
import db from "@/lib/db"
import { SubtitleSettings, subtitleSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function handleTranscriptionOrder({ transcriptions }: { transcriptions: SubtitleSettings['transcriptionOrder'] }) {
    try {
        const {error, settingsId } = await ensureSubtitleSettingsExists()
    
        if(!settingsId || error) return {
            message: null,
            error: error,
        }
        
        const data = await db.update(subtitleSettings).set({
                transcriptionOrder: transcriptions,
            })
            .where(eq(subtitleSettings.id, settingsId)) 
    
        if(!data) return {
            message: null,
            error: 'failed to insert transcription order, try again later...',
        }
    
        return {
            message: "Transcription order saved.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to insert transcription order setting",
        }
    }
}