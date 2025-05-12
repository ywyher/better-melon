"use server"

import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { subtitleStylesSchema } from "@/app/settings/subtitle/types";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { ensureAuthenticated } from "@/lib/db/mutations";
import { SubtitleStyles, subtitleStyles } from "@/lib/db/schema";
import { SubtitleTranscription } from "@/types/subtitle";
import { generateId } from "better-auth";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export async function getMultipleTranscriptionsStyles(transcriptions: SubtitleTranscription[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) {
    // Return default styles for each requested transcription
    return transcriptions.reduce((acc, transcription) => {
      acc[transcription] = defaultSubtitleStyles;
      return acc;
    }, {} as Record<SubtitleTranscription, typeof defaultSubtitleStyles>);
  }
  
  // Always include 'all' in our query since it's the fallback style
  const transcriptionsToFetch = [...new Set([...transcriptions, 'all' as SubtitleTranscription])];
  
  const fetchedStyles = await db.select().from(subtitleStyles)
    .where(and(
      eq(subtitleStyles.userId, session.user.id),
      inArray(subtitleStyles.transcription, transcriptionsToFetch)
    ));
  
  // Create a map of transcription -> styles, but only for transcriptions that have
  // explicit styles in the database
  const stylesMap = fetchedStyles.reduce((acc, style) => {
    acc[style.transcription] = style;
    return acc;
  }, {} as Record<SubtitleTranscription | 'all', typeof defaultSubtitleStyles>);

  // We're no longer filling in missing transcriptions with default styles
  // Only returning styles that were explicitly found in the database
  
  return stylesMap as Record<SubtitleTranscription, typeof defaultSubtitleStyles>;
}

export async function getAllSubtitleStyles() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) {
      return { all: defaultSubtitleStyles };
  }
  
  const allStyles = await db.select().from(subtitleStyles)
      .where(eq(subtitleStyles.userId, session.user.id));
  
  // Create a map of transcription -> styles
  const stylesMap = allStyles.reduce((acc, style) => {
      acc[style.transcription] = style;
      return acc;
  }, {} as Record<string, typeof defaultSubtitleStyles>);

  // Make sure we have an "all" styles entry
  if (!stylesMap.all) {
      stylesMap.all = defaultSubtitleStyles;
  }
  
  return stylesMap as Record<SubtitleTranscription, SubtitleStyles>;
}

export async function getSubtitleStyles({ transcription }: { transcription: SubtitleStyles['transcription'] }) {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
      return defaultSubtitleStyles;
    }
    
    const fetchStylesStart = performance.now()
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
            subtitleStylesId: newStylesId,
        };
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to create subtitle styles",
            subtitleStylesId: null,
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