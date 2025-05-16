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
    }

    try {
        const [exists] = await db.select().from(subtitleSettings).where(eq(subtitleSettings.userId, userId))
        
        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            settingsId: exists.id,
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
        };
    } catch (error: unknown) {
        return {
            error: error instanceof Error ? error.message : "Something went wrong while inserting the settings.",
            message: null,
            settingsId: null,
        };
    }
}

export async function handleMatchPattern({ matchPattern }: { matchPattern: SubtitleSettings['matchPattern'] }) {
    try {
        const {error, settingsId } = await handleSubtitleSettings()
    
        if(!settingsId || error) return {
            message: null,
            error: error,
        }
        
        const data = await db.update(subtitleSettings).set({
                matchPattern
            })
            .where(eq(subtitleSettings.id, settingsId)) 
    
        if(!data) return {
            message: null,
            error: 'failed to insert match pattern, try again later...',
        }
    
        return {
            message: "Match pattern saved.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to insert match pattern setting",
        }
    }
}

export async function handleDeleteMatchPattern({ settingsId }: { settingsId: SubtitleSettings['id'] }) {
    const headersList = await headers();
    const currentUser = await auth.api.getSession({ headers: headersList });

    if (!currentUser || !currentUser.user.id) return {
        message: null,
        error: "Not authenticated nor were we able to authenticate you as an anonymous user. Please register."
    };

    try {
        const data = await db.update(subtitleSettings)
            .set({
                matchPattern: null
            })
            .where(eq(subtitleSettings.id, settingsId)) 
    
        if(!data) return {
            message: null,
            error: 'failed to delete preferred format, try again later...',
        }
    
        return {
            message: "Preferred subtitle deleted.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to delete preferred format setting",
        }
    }
}

export async function handlePreferredFormat({ format }: { format: SubtitleSettings['preferredFormat'] }) {
    try {
        const {error ,settingsId } = await ensureSubtitleSettingsExists()
    
        if(!settingsId || error) return {
            message: null,
            error: error,
        }
        
        const data = await db.update(subtitleSettings).set({
                preferredFormat: format
            })
            .where(eq(subtitleSettings.id, settingsId)) 
    
        if(!data) return {
            message: null,
            error: 'failed to insert preferred format, try again later...',
        }
    
        return {
            message: "Preferred subtitle saved.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to insert preferred format setting",
        }
    }
}

export async function handleDeletePreferredFormat({ settingsId }: { settingsId: SubtitleSettings['id'] }) {
    const headersList = await headers();
    const currentUser = await auth.api.getSession({ headers: headersList });

    if (!currentUser || !currentUser.user.id) return {
        message: null,
        error: "Not authenticated nor were we able to authenticate you as an anonymous user. Please register."
    };

    try {
        const data = await db.update(subtitleSettings)
            .set({
                preferredFormat: null
            })
            .where(eq(subtitleSettings.id, settingsId)) 
    
        if(!data) return {
            message: null,
            error: 'failed to delete preferred format, try again later...',
        }
    
        return {
            message: "Preferred subtitle deleted.",
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to delete preferred format setting",
        }
    }
}