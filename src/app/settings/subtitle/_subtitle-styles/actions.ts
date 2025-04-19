"use server"

import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { subtitleStylesSchema } from "@/app/settings/subtitle/types";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { ensureAuthenticated } from "@/lib/db/mutations";
import { SubtitleStyles, subtitleStyles } from "@/lib/db/schema";
import { generateId } from "better-auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export async function getSubtitleStyles({ transcription }: { transcription: SubtitleStyles['transcription'] }) {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
        return defaultSubtitleStyles;
    }
    
    const [styles] = await db.select().from(subtitleStyles)
    .where(and(
        eq(subtitleStyles.userId, session.user.id),
        eq(subtitleStyles.transcription, transcription)
    ))

    if(styles) {
        return styles
    }else {
        return defaultSubtitleStyles
    }
}

export async function createSubtitleStyles({ 
  data,
  transcription,
}: { 
  data: z.infer<typeof subtitleStylesSchema>,
  transcription: SubtitleStyles['transcription']
}) {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
        message: null,
        error: error,
    }
    
    try {
        const newStylesId = generateId();

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
        
        await db.insert(subtitleStyles).values({
            id: newStylesId,
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
            transcription,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Subtitle styles created successfully",
            error: null,
            stylesId: newStylesId,
        };
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to create subtitle styles",
        };
    }
}

export async function updateSubtitleStyles({ 
  subtitleStylesId,
  data,
  transcription
}: { 
  subtitleStylesId: SubtitleStyles['id'],
  data: z.infer<typeof subtitleStylesSchema>,
  transcription: SubtitleStyles['transcription']
}) {
    const headersList = await headers();
    const currentUser = await auth.api.getSession({ headers: headersList });
    
    if (!currentUser?.user?.id) {
        return {
            message: null,
            error: "Not authenticated. Please sign in to update styles."
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
        
        await db.update(subtitleStyles).set({
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
            eq(subtitleStyles.userId, currentUser.user.id),
            eq(subtitleStyles.id, subtitleStylesId),
            eq(subtitleStyles.transcription, transcription)
        ));
        
        return {
            message: "Subtitle styles updated successfully",
            error: null
        };
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to update subtitle styles",
        };
    }
}

export async function deleteSubtitleStyles({
    subtitleStylesId
}: {
    subtitleStylesId: SubtitleStyles['id']
}) {
    const headersList = await headers();
    const currentUser = await auth.api.getSession({ headers: headersList });
    
    if (!currentUser?.user?.id) {
        return {
            message: null,
            error: "Not authenticated. Please sign in to delete styles."
        };
    }

    try {
        await db.delete(subtitleStyles).where(and(
            eq(subtitleStyles.id, subtitleStylesId),
            eq(subtitleStyles.userId, currentUser.user.id)
        ))        
        
        return {
            message: "Subtitle styles deleted successfully",
            error: null
        };
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to delete subtitle styles",
        };
    }
}