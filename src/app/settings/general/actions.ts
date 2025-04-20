'use server'

import { defaultGeneralSettings } from "@/app/settings/general/constants"
import { auth } from "@/lib/auth"
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