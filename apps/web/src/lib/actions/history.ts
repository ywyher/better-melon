'use server'

import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { history, History } from "@/lib/db/schema"
import { AnilistCoverImage, AnilistTitle } from "@better-melon/shared/types"
import { generateId } from "better-auth"
import { and, desc, eq } from "drizzle-orm"

type EnsureHistoryExistsProps = {
  mediaId: string | number;
  mediaTitle: AnilistTitle;
  mediaCoverImage: AnilistCoverImage;
  mediaEpisode: number
}

export async function ensureHistoryExists({
  mediaId,
  mediaTitle,
  mediaCoverImage,
  mediaEpisode
}: EnsureHistoryExistsProps) {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
        message: null,
        error: error,
        historyId: null,
        userId: null
    }

    try {
        const [exists] = await db.select().from(history)
          .where(and(
            eq(history.userId, userId),
            eq(history.mediaId, String(mediaId)),
            eq(history.mediaEpisode, mediaEpisode),
          ))

        if(exists?.id) return {
            message: "Already exists, skipping...",
            error: null,
            historyId: exists.id,
            userId: exists.userId
        }

        const id = generateId();
        await db.insert(history).values({
            id,
            duration: 0,
            progress: 0,
            mediaId: String(mediaId),
            mediaTitle,
            mediaCoverImage,
            mediaEpisode,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Media saved in history successfully",
            error: null,
            historyId: id,
            userId
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to save media in history",
            historyId: null,
            userId: null
        }
    }
}

type SaveInHistoryProps = {
  data: Pick<History, 'mediaCoverImage' | 'mediaId' | 'mediaTitle' | 'mediaEpisode'> & Partial<Omit<History, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
}

type DeleteFromHistoryProps = {
  mediaId: History['mediaId']
  mediaEpisode: History['mediaEpisode']
}

export async function saveInHistory({ data }: SaveInHistoryProps) {
  const { mediaCoverImage, mediaId, mediaTitle, mediaEpisode } = data

  try {
      const {error, historyId, userId } = await ensureHistoryExists({ 
          mediaCoverImage,
          mediaId,
          mediaTitle,
          mediaEpisode
      })
  
      if(!historyId || error || !userId) return {
          message: null,
          error: error,
      }
      
      const result = await db.update(history)
      .set({
          ...data,
          updatedAt: new Date()
      })
      .where(and(
          eq(history.id, historyId),
          eq(history.userId, userId)
      )) 
  
      if(!result) return {
        message: null,
        error: 'Failed to save media in history, try again later...',
      }
  
      return {
        message: "Media saved in history..",
        error: null
      }
  } catch (error: unknown) {
      return {
        message: null,
        error: error instanceof Error ? error.message : "Failed to save media in history",
      }
  }
}

export async function deleteFromHistory({ mediaId, mediaEpisode }: DeleteFromHistoryProps) {
  try {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
      message: null,
      error: error,
    }

    const result = await db.delete(history)
      .where(and(
        eq(history.mediaId, mediaId),
        eq(history.mediaEpisode, mediaEpisode),
        eq(history.userId, userId)
      )) 

    if(!result) return {
      message: null,
      error: 'Failed to save media in history, try again later...',
    }

    return {
      message: "Media saved in history..",
      error: null
    }
  } catch (error: unknown) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to save media in history",
    }
  }
}

export async function getHistory({ limit }: { limit?: number }) {
    try {
        const { userId, error } = await ensureAuthenticated()
    
        if(!userId || error) return {
            message: null,
            error: error,
            history: [],
        }

        let list = await db
            .select()
            .from(history)
            .where(eq(history.userId, userId))
            .orderBy(desc(history.updatedAt))
            .limit(limit ?? Number.MAX_SAFE_INTEGER);


        return {
            history: list,
            message: "history",
            error: null
        };
    } catch(error) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to get history.",
            history: []
        }
    }
}

export async function getHistoryByMedia({ 
  mediaId, 
  mediaEpisode 
}: { 
  mediaId: string; 
  mediaEpisode: number 
}) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(!userId || error) return {
      message: null,
      error: error,
      history: null,
    }
    
    const [mediaHistory] = await db
      .select()
      .from(history)
        .where(and(
            eq(history.userId, userId),
            eq(history.mediaId, mediaId),
            eq(history.mediaEpisode, mediaEpisode)
        ));
    
    return {
      history: mediaHistory,
      message: "history by media",
      error: null
    };
  } catch(error) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to get history by media.",
      history: null
    }
  }
}