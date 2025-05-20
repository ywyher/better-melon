'use server'

import { defaultPlayerSettings } from "@/app/settings/player/constants"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { PlayerSettings, playerSettings } from "@/lib/db/schema"
import { SubtitleTranscription } from "@/types/subtitle"
import { generateId } from "better-auth"
import { and, eq } from "drizzle-orm"
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
        playerSettingsId: null,
        userId: null
    }

    try {
        const [exists] = await db.select().from(playerSettings).where(eq(playerSettings.userId, userId))

        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            playerSettingsId: exists.id,
            userId: exists.userId
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
            userId
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update subtitle styles",
            playerSettingsId: null,
            userId: null
        }
    }
}

export async function handlePlayerSettings<T extends Partial<Omit<PlayerSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>>(
  data: T
) {
    try {
        const {error, playerSettingsId, userId } = await ensurePlayerSettingsExists()
    
        if(!playerSettingsId || error || !userId) return {
            message: null,
            error: error,
        }
        
        const result = await db.update(playerSettings)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(and(
            eq(playerSettings.id, playerSettingsId),
            eq(playerSettings.userId, userId)
        )) 
    
        if(!result) return {
            message: null,
            error: 'Failed to update player settings, try again later...',
        }
    
        return {
            message: "Player settings updated successfully.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update player settings",
        }
    }
}

export async function handleEnabledTranscriptions({ transcriptions }: {
    transcriptions: SubtitleTranscription[],
}) {
    const { error, playerSettingsId, userId } = await ensurePlayerSettingsExists()
    
    if (!playerSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(playerSettings)
            .set({
                enabledTranscriptions: transcriptions
            })
            .where(and(
                eq(playerSettings.id, playerSettingsId),
                eq(playerSettings.userId, userId),
            )) 
    
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