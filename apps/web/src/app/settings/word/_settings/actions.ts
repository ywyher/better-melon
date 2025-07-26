'use server'

import { defaultWordSettings } from "@/app/settings/word/constants"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { WordSettings, wordSettings } from "@/lib/db/schema"
import { generateId } from "better-auth"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getWordSettings() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
        return defaultWordSettings;
    }

    const [settings] = await db.select().from(wordSettings)
        .where(eq(wordSettings.userId, session.user.id))

    return settings || defaultWordSettings
}

export async function ensureWordSettingsExists() {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
        message: null,
        error: error,
        wordSettingsId: null,
        userId: null
    }

    try {
        const [exists] = await db.select().from(wordSettings).where(eq(wordSettings.userId, userId))

        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            wordSettingsId: exists.id,
            userId: exists.userId
        }

        const newSettingsId = generateId();

        await db.insert(wordSettings).values({
            id: newSettingsId,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Word settings created successfully",
            error: null,
            wordSettingsId: newSettingsId,
            userId
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update word styles",
            wordSettingsId: null,
            userId: null
        }
    }
}

export async function handleWordSettings<T extends Partial<Omit<WordSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>>(
  data: T
) {
    try {
        const {error, wordSettingsId, userId } = await ensureWordSettingsExists()
    
        if(!wordSettingsId || error || !userId) return {
            message: null,
            error: error,
        }
        
        const result = await db.update(wordSettings)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(and(
            eq(wordSettings.id, wordSettingsId),
            eq(wordSettings.userId, userId)
        )) 
    
        if(!result) return {
            message: null,
            error: 'Failed to update word settings, try again later...',
        }
    
        return {
            message: "Word settings updated successfully.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update word settings",
        }
    }
}