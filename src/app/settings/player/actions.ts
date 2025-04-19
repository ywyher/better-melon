'use server'

import { defaultPlayerSettings } from "@/app/settings/player/constants"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { playerSettings } from "@/lib/db/schema"
import { SubtitleTranscription } from "@/types/subtitle"
import { generateId } from "better-auth"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getPlayerSettings() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
        return defaultPlayerSettings;
    }

    const [settings] = await db.select().from(playerSettings)
        .where(eq(playerSettings.userId, session.user.id))

    return settings || defaultPlayerSettings
}

export async function ensurePlayerSettingsExists() {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
        message: null,
        error: error,
        playerSettingsId: null
    }

    try {
        const [exists] = await db.select().from(playerSettings).where(eq(playerSettings.userId, userId))

        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            playerSettingsId: exists.id,
        }

        const newSettingsId = generateId();

        await db.insert(playerSettings).values({
            id: newSettingsId,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Subtitle settings created successfully",
            error: null,
            playerSettingsId: newSettingsId,
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update subtitle styles",
            playerSettingsId: null
        }
    }
}

export async function handleEnabledTranscriptions(transcriptions: SubtitleTranscription[]) {
    const { error, playerSettingsId } = await ensurePlayerSettingsExists()
    
    if (!playerSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(playerSettings)
            .set({
                enabledTranscriptions: transcriptions
            })
            .where(eq(playerSettings.id, playerSettingsId)) 
    
        if(!data) return {
            message: null,
            error: `Failed to update Transcriptions, try again later...`,
        }
    
        return {
            message: `Transcriptions setting saved.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to update transcriptions`,
        }
    }
}

export async function handlePlaybackSetting(settingName: 'autoPlay' | 'autoNext' | 'autoSkip', checked: boolean) {
    const { error, playerSettingsId } = await ensurePlayerSettingsExists()

    if (!playerSettingsId || error) return {
        message: null,
        error: error,
    }

    try {
        // Create dynamic update object with the specific setting
        const updateData = { [settingName]: checked };
        
        const data = await db.update(playerSettings)
            .set(updateData)
            .where(eq(playerSettings.id, playerSettingsId)) 

        if(!data) return {
            message: null,
            error: `Failed to update ${settingName}, try again later...`,
        }

        return {
            message: `${settingName} setting saved.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to update ${settingName}`,
        }
    }
}