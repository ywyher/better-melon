'use server'

import { auth } from "@/lib/auth"
import { defaultGeneralSettings } from "@/lib/constants/settings"
import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { GeneralSettings, generalSettings } from "@/lib/db/schema"
import { generateId } from "better-auth"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getGeneralSettings() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
        return defaultGeneralSettings;
    }

    const [settings] = await db.select().from(generalSettings)
        .where(eq(generalSettings.userId, session.user.id))

    return settings || defaultGeneralSettings
}

export async function ensureGeneralSettingsExists() {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
        message: null,
        error: error,
        generalSettingsId: null
    }

    try {
        const [exists] = await db.select().from(generalSettings).where(eq(generalSettings.userId, userId))

        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            generalSettingsId: exists.id,
        }

        const newSettingsId = generateId();

        await db.insert(generalSettings).values({
            id: newSettingsId,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Subtitle settings created successfully",
            error: null,
            generalSettingsId: newSettingsId,
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update subtitle styles",
            generalSettingsId: null
        }
    }
}

export async function handleSyncPlayerSettings({ strategy }: { strategy: GeneralSettings['syncPlayerSettings'] }) {
    const { error, generalSettingsId } = await ensureGeneralSettingsExists()
    
    if (!generalSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(generalSettings)
            .set({
                syncPlayerSettings: strategy
            })
            .where(eq(generalSettings.id, generalSettingsId)) 
    
        if(!data) return {
            message: null,
            error: `Failed to update Sync strategy, try again later...`,
        }
    
        return {
            message: `Sync strategy setting saved.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to update sync strategy`,
        }
    }
}

export async function handleHideSpoilersSettings({ value }: { value: GeneralSettings['hideSpoilers'] }) {
    const { error, generalSettingsId } = await ensureGeneralSettingsExists()
    
    if (!generalSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(generalSettings)
            .set({
                hideSpoilers: value
            })
            .where(eq(generalSettings.id, generalSettingsId)) 
    
        if(!data) return {
            message: null,
            error: `Failed to hide spoilers, try again later...`,
        }
    
        return {
            message: `Spoliers got hidden.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to hide spoilers`,
        }
    }
}

export async function handleScreenshotNamingDialog({ value }: { value: GeneralSettings['screenshotNamingDialog'] }) {
    const { error, generalSettingsId } = await ensureGeneralSettingsExists()
    
    if (!generalSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(generalSettings)
            .set({
                screenshotNamingDialog: value
            })
            .where(eq(generalSettings.id, generalSettingsId)) 
    
        if(!data) return {
            message: null,
            error: `Failed to enable naming dialog, try again later...`,
        }
    
        return {
            message: `Naming dialog is now ${value == true ? 'enabled' : 'disabled'}.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to enable naming dialog, try again later...`,
        }
    }   
}

export async function handleScreenshotNamingPattern({ pattern }: { pattern: GeneralSettings['screenshotNamingPattern'] }) {
    const { error, generalSettingsId } = await ensureGeneralSettingsExists()
    
    if (!generalSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(generalSettings)
            .set({
                screenshotNamingPattern: pattern
            })
            .where(eq(generalSettings.id, generalSettingsId)) 
    
        if(!data) return {
            message: null,
            error: `Failed to save naming pattern, try again later...`,
        }
    
        return {
            message: `Naming pattern is saved.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to save naming pattern, try again later...`,
        }
    }   
}

export async function handleScreenshotFormat({ format }: { format: GeneralSettings['screenshotFormat'] }) {
    const { error, generalSettingsId } = await ensureGeneralSettingsExists()
    
    if (!generalSettingsId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const data = await db.update(generalSettings)
            .set({
                screenshotFormat: format
            })
            .where(eq(generalSettings.id, generalSettingsId)) 
    
        if(!data) return {
            message: null,
            error: `Failed to save format, try again later...`,
        }
    
        return {
            message: `Format saved.`,
            error: null
        }
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : `Failed to save format, try again later...`,
        }
    }   
}