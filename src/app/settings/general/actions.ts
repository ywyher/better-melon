'use server'

import { auth } from "@/lib/auth"
import { defaultGeneralSettings } from "@/lib/constants/settings"
import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { GeneralSettings, generalSettings } from "@/lib/db/schema"
import { generateId } from "better-auth"
import { and, eq } from "drizzle-orm"
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
        generalSettingsId: null,
        userId: null
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
            userId: userId,
            generalSettingsId: newSettingsId,
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update subtitle styles",
            generalSettingsId: null,
            userId: null
        }
    }
}

export async function handleGeneralSettings<T extends Partial<Omit<GeneralSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>>(
  data: T
) {
  const { error, generalSettingsId, userId } = await ensureGeneralSettingsExists();
  
  if (!generalSettingsId || error || !userId) return {
    message: null,
    error: error,
  };
  
  try {
    const result = await db.update(generalSettings)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(
        eq(generalSettings.id, generalSettingsId),
        eq(generalSettings.userId, userId)
      ));
    
    if (!result) return {
      message: null,
      error: `Failed to update general settings, try again later...`,
    };
    
    return {
      message: `General settings updated successfully.`,
      error: null
    };
  } catch (error: unknown) {
    return {
      message: null,
      error: error instanceof Error ? error.message : `Failed to update general settings`,
    };
  }
}