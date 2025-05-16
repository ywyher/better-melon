"use server"

import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { ensureAuthenticated } from "@/lib/db/mutations";
import { SubtitleStyles, subtitleStyles } from "@/lib/db/schema";
import { camelCaseToTitleCase } from "@/lib/utils";
import { SubtitleTranscription } from "@/types/subtitle";
import { generateId } from "better-auth";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";

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
  }, {} as Record<SubtitleStyles['transcription'], typeof defaultSubtitleStyles>);

  // We're no longer filling in missing transcriptions with default styles
  // Only returning styles that were explicitly found in the database
  
  return stylesMap as Record<SubtitleTranscription, typeof defaultSubtitleStyles>;
}

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

export async function ensureSubtitlStylesExists({ transcription }: { transcription: SubtitleStyles['transcription'] }) {
  const { userId, error } = await ensureAuthenticated()

  if(!userId || error) return {
      message: null,
      error: error,
  }

  try {
      const [exists] = await db.select().from(subtitleStyles)
      .where(and(
        eq(subtitleStyles.userId, userId),
        eq(subtitleStyles.transcription, transcription)
      ))
      
      if(exists?.id) return {
          message: "Already exists, skipping...",
          error: null,
          stylesId: exists.id,
      }

      const newStylesId = generateId();

      await db.insert(subtitleStyles).values({
          id: newStylesId,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
      });

      return {
          message: "Subtitle settings created successfully",
          error: null,
          stylesId: newStylesId,
      };
  } catch (error: unknown) {
      return {
          error: error instanceof Error ? error.message : "Something went wrong while inserting the styles.",
          message: null,
          stylesId: null,
      };
  }
}

export async function handleSubtitleStyles({
  field,
  value,
  transcription,
}: {
  field: keyof Omit<SubtitleStyles, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  value: string | number,
  transcription: SubtitleStyles['transcription']
}) {
  const { error, stylesId } = await ensureSubtitlStylesExists({ transcription });

  if(!stylesId || error) return {
    message: null,
    error: error,
  }
  
  try {
    const updateData: Partial<SubtitleStyles> = {
      updatedAt: new Date(),
      [field]: value
    };
    
    await db.update(subtitleStyles)
      .set(updateData)
      .where(eq(subtitleStyles.id, stylesId));
      
    return {
      message: `Subtitle styles ${camelCaseToTitleCase(field)} updated successfully  in action`,
      error: null,
    };
  } catch (error: unknown) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to create subtitle styles",
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