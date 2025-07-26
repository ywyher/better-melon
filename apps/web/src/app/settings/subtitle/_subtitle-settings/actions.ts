'use server'

import { defaultSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/constants";
import { auth } from "@/lib/auth"
import db from "@/lib/db";
import { ensureAuthenticated } from "@/lib/db/mutations";
import { SubtitleSettings, subtitleSettings } from "@/lib/db/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers"

export async function getSubtitleSettings() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) return defaultSubtitleSettings;
        
    const [settings] = await db.select().from(subtitleSettings)
        .where(and(
            eq(subtitleSettings.userId, session.user.id),
        ))

    return settings || defaultSubtitleSettings
} 

export async function ensureSubtitleSettingsExists() {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
        message: null,
        error: error,
        settingsId: null,
        userId: null
    }

    try {
        const [exists] = await db.select().from(subtitleSettings).where(eq(subtitleSettings.userId, userId))
        
        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            settingsId: exists.id,
            userId
        }

        const newSettingsId = generateId();

        await db.insert(subtitleSettings).values({
            id: newSettingsId,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Subtitle settings created successfully",
            error: null,
            settingsId: newSettingsId,
            userId: null
        };
    } catch (error: unknown) {
        return {
            error: error instanceof Error ? error.message : "Something went wrong while inserting the settings.",
            message: null,
            settingsId: null,
            userId: null
        };
    }
}

export async function handleSubtitleSettings<T extends Partial<Omit<SubtitleSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>>(
  data: T
) {
    try {
        const {error, settingsId, userId } = await ensureSubtitleSettingsExists()
    
        if(!settingsId || error || !userId) return {
            message: null,
            error: error,
        }
        
        const result = await db.update(subtitleSettings)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(and(
            eq(subtitleSettings.id, settingsId),
            eq(subtitleSettings.userId, userId)
        )) 
    
        if(!result) return {
            message: null,
            error: 'Failed to update subtitle settings, try again later...',
        }
    
        return {
            message: "Subtitle settings updated successfully.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update subtitle settings",
        }
    }
}