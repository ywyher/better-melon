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

  // console.log(fetchedStyles);

  // Create a map of transcription -> { default: style, active: style }
  const stylesMap = fetchedStyles.reduce((acc, style) => {
    // Initialize the transcription object if it doesn't exist
    if (!acc[style.transcription]) {
      acc[style.transcription] = {};
    }
    
    // Add the style to the appropriate state
    acc[style.transcription][style.state] = style;
    
    return acc;
  }, {} as Record<SubtitleStyles['transcription'], Record<string, any>>);

  // Ensure 'all' transcription has both default and active states
  if (stylesMap['all']) {
    if (!stylesMap['all'].default) {
      stylesMap['all'].default = defaultSubtitleStyles.default;
    }
    if (!stylesMap['all'].active) {
      stylesMap['all'].active = defaultSubtitleStyles.active;
    }
  } else {
    // If 'all' doesn't exist at all, set it to defaultSubtitleStyles
    stylesMap['all'] = defaultSubtitleStyles;
  }

  return stylesMap as Record<SubtitleTranscription, typeof defaultSubtitleStyles>;
}

export async function getSubtitleStyles({ transcription, state }: { transcription: SubtitleStyles['transcription'], state: SubtitleStyles['state'] }) {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) {
      return state == 'default' ? defaultSubtitleStyles.default : defaultSubtitleStyles.active;
    }
    
    const [styles] = await db.select().from(subtitleStyles)
    .where(and(
        eq(subtitleStyles.userId, session.user.id),
        eq(subtitleStyles.transcription, transcription),
        eq(subtitleStyles.state, state)
    ))

    if(styles) {
      return styles
    }else {
      return state == 'default' ? defaultSubtitleStyles.default : defaultSubtitleStyles.active
    }
}

export async function ensureSubtitlStylesExists({ transcription, state }: { transcription: SubtitleStyles['transcription'], state: SubtitleStyles['state'] }) {
  const { userId, error } = await ensureAuthenticated()

  if(!userId || error) return {
      message: null,
      error: error,
  }

  try {
      const [exists] = await db.select().from(subtitleStyles)
      .where(and(
        eq(subtitleStyles.userId, userId),
        eq(subtitleStyles.transcription, transcription),
        eq(subtitleStyles.state, state)
      ))
      
      if(exists?.id) return {
          message: "Already exists, skipping...",
          error: null,
          stylesId: exists.id,
      }

      const newStylesId = generateId();

      const styles = state == 'default' ? defaultSubtitleStyles.default : defaultSubtitleStyles.active

      await db.insert(subtitleStyles).values({
          ...styles,
          id: newStylesId,
          userId: userId,
          transcription,
          state,
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
  state
}: {
  field: keyof Omit<SubtitleStyles, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  value: string | number,
  transcription: SubtitleStyles['transcription']
  state: SubtitleStyles['state']
}) {
  const { error, stylesId } = await ensureSubtitlStylesExists({ transcription, state });

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
        message: "Subtitle styles removed successfully",
        error: null
      };
    } catch (error: unknown) {
      return {
        message: null,
        error: error instanceof Error ? error.message : "Failed to delete subtitle styles",
      };
    }
}