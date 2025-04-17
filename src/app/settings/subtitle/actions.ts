"use server"

import { defaultSubtitleSettings } from "@/app/settings/subtitle/constants";
import { subtitleSettingsSchema } from "@/app/settings/subtitle/types";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { SubtitleSettings, subtitleSettings } from "@/lib/db/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export async function getGlobalSubtitleSettings({ transcription }: { transcription: SubtitleSettings['transcription'] }) {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
        return defaultSubtitleSettings;
    }
        
    const [settings] = await db.select().from(subtitleSettings)
    .where(and(
        eq(subtitleSettings.userId, session.user.id),
        eq(subtitleSettings.isGlobal, true),
        eq(subtitleSettings.transcription, transcription)
    ))

    if(settings) {
        return settings
    }else {
        return defaultSubtitleSettings
    }
}

export async function createSubtitleSettings({ 
  data,
  transcription,
}: { 
  data: z.infer<typeof subtitleSettingsSchema>,
  transcription: SubtitleSettings['transcription']
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
        const newSettingsId = generateId();

        const {
            fontSize,
            fontFamily,
            textColor,
            textOpacity,
            textShadow,
            backgroundColor,
            backgroundOpacity,
            backgroundBlur,
            backgroundRadius,
        } = data;
        
        await db.insert(subtitleSettings).values({
            id: newSettingsId,
            userId: userId,
            fontSize,
            fontFamily,
            textColor,
            textOpacity,
            textShadow,
            backgroundColor,
            backgroundOpacity,
            backgroundBlur,
            backgroundRadius,
            transcription: transcription,
            animeId: null,
            isGlobal: true,
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

export async function updateSubtitleSettings({ 
  subtitleSettingsId,
  data,
  transcription
}: { 
  subtitleSettingsId: SubtitleSettings['id'],
  data: z.infer<typeof subtitleSettingsSchema>,
  transcription: SubtitleSettings['transcription']
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
        const {
            fontSize,
            fontFamily,
            textColor,
            textOpacity,
            textShadow,
            backgroundColor,
            backgroundOpacity,
            backgroundBlur,
            backgroundRadius,
        } = data;
        
        await db.update(subtitleSettings).set({
            fontSize,
            fontFamily,
            textColor,
            textOpacity,
            textShadow,
            backgroundColor,
            backgroundOpacity,
            backgroundBlur,
            backgroundRadius,
            updatedAt: new Date(),
        }).where(and(
            eq(subtitleSettings.userId, currentUser.user.id),
            eq(subtitleSettings.id, subtitleSettingsId),
            eq(subtitleSettings.transcription, transcription)
        ));
        
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

export async function deleteSubtitleSettings({
    subtitleSettingsId
}: {
    subtitleSettingsId: SubtitleSettings['id']
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
        await db.delete(subtitleSettings).where(and(
            eq(subtitleSettings.id, subtitleSettingsId),
            eq(subtitleSettings.userId, currentUser.user.id)
        ))        
        
        return {
            message: "Subtitle settings deleted successfully",
            error: null
        };
    } catch (error) {
        return {
            message: null,
            error: "Failed to update subtitle settings"
        };
    }
}