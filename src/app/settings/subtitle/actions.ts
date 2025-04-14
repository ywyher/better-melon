"use server"

import { subtitleSettingsSchema } from "@/app/settings/subtitle/types";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { subtitleSettings } from "@/lib/db/schema";
import { generateId } from "better-auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export async function getGlobalSubtitleSettings() {
    const test = await db.select().from(subtitleSettings)
}

export async function createSubtitleSettings({ 
  data, 
  enabledTranscriptions = ['japanese', 'english']
}: { 
  data: z.infer<typeof subtitleSettingsSchema>,
  enabledTranscriptions?: string[]
}) {
    // Get current user or create anonymous user
    const headersList = await headers();
    const currentUser = await auth.api.getSession({ headers: headersList });
    
    let userId: string;

    if (!currentUser || !currentUser.user.id) {
        const anon = await auth.api.signInAnonymous();
        
        if (!anon?.user?.id) {
            return {
                message: null,
                error: "Not authenticated nor were we able to authenticate you as an anonymous user. Please register."
            };
        }

        userId = anon.user.id;
    } else {
        userId = currentUser.user.id;
    }
    
    try {
        // Create the subtitle settings record
        const newSettingsId = generateId();

        await db.insert(subtitleSettings).values({
            id: newSettingsId,
            userId: userId,
            globalSettings: data,
            enabledTranscriptions: enabledTranscriptions,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Subtitle settings created successfully",
            error: null,
            settingsId: newSettingsId
        };
    } catch (error) {
        console.error("Error creating subtitle settings:", error);
        return {
            message: null,
            error: "Failed to create subtitle settings"
        };
    }
}

// Function to update existing subtitle settings
export async function updateSubtitleSettings({ 
  settingsId,
  data, 
  enabledTranscriptions
}: { 
  settingsId: string,
  data: z.infer<typeof subtitleSettingsSchema>,
  enabledTranscriptions?: string[]
}) {
    const headersList = await headers();
    const currentUser = await auth.api.getSession({ headers: headersList });
    
    if (!currentUser?.user?.id) {
        return {
            message: null,
            error: "Not authenticated. Please sign in to update settings."
        };
    }
    
    try {
        const updateData: Record<string, any> = {
            globalSettings: data,
            updatedAt: new Date()
        };
        
        if (enabledTranscriptions) {
            updateData.enabledTranscriptions = enabledTranscriptions;
        }
        
        await db
            .update(subtitleSettings)
            .set(updateData)
            .where(eq(subtitleSettings.id, settingsId))

        return {
            message: "Subtitle settings updated successfully",
            error: null
        };
    } catch (error) {
        console.error("Error updating subtitle settings:", error);
        return {
            message: null,
            error: "Failed to update subtitle settings"
        };
    }
}