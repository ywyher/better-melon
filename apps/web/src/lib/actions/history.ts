'use server'

import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { history, History } from "@/lib/db/schema"
import { AnilistCoverImage, AnilistTitle } from "@better-melon/shared/types"
import { generateId } from "better-auth"
import { and, desc, eq } from "drizzle-orm"

type EnsureHistoryExistsProps = {
  animeId: string | number;
  animeTitle: AnilistTitle;
  animeCoverImage: AnilistCoverImage;
  animeEpisode: number
}

export async function ensureHistoryExists({
  animeId,
  animeTitle,
  animeCoverImage,
  animeEpisode
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
            eq(history.animeId, String(animeId)),
            eq(history.animeEpisode, animeEpisode),
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
            animeId: String(animeId),
            animeTitle,
            animeCoverImage,
            animeEpisode,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return {
            message: "Anime saved in history successfully",
            error: null,
            historyId: id,
            userId
        }; 
    } catch (error: unknown) {
        return {
            message: null,
            error: error instanceof Error ? error.message : "Failed to save anime in history",
            historyId: null,
            userId: null
        }
    }
}

type SaveInHistoryProps = {
  data: Pick<History, 'animeCoverImage' | 'animeId' | 'animeTitle' | 'animeEpisode'> & Partial<Omit<History, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
}

type DeleteFromHistoryProps = {
  animeId: History['animeId']
  animeEpisode: History['animeEpisode']
}

export async function saveInHistory({ data }: SaveInHistoryProps) {
  const { animeCoverImage, animeId, animeTitle, animeEpisode } = data

  try {
      const {error, historyId, userId } = await ensureHistoryExists({ 
          animeCoverImage,
          animeId,
          animeTitle,
          animeEpisode
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
        error: 'Failed to save anime in history, try again later...',
      }
  
      return {
        message: "Anime saved in history..",
        error: null
      }
  } catch (error: unknown) {
      return {
        message: null,
        error: error instanceof Error ? error.message : "Failed to save anime in history",
      }
  }
}

export async function deleteFromHistory({ animeId, animeEpisode }: DeleteFromHistoryProps) {
  try {
    const { userId, error } = await ensureAuthenticated()

    if(!userId || error) return {
      message: null,
      error: error,
    }

    const result = await db.delete(history)
      .where(and(
        eq(history.animeId, animeId),
        eq(history.animeEpisode, animeEpisode),
        eq(history.userId, userId)
      )) 

    if(!result) return {
      message: null,
      error: 'Failed to save anime in history, try again later...',
    }

    return {
      message: "Anime saved in history..",
      error: null
    }
  } catch (error: unknown) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to save anime in history",
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

        const list = await db
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

export async function getHistoryByAnime({ 
  animeId, 
  animeEpisode 
}: { 
  animeId: string; 
  animeEpisode: number 
}) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(!userId || error) return {
      message: null,
      error: error,
      history: null,
    }
    
    const [animeHistory] = await db
      .select()
      .from(history)
        .where(and(
            eq(history.userId, userId),
            eq(history.animeId, animeId),
            eq(history.animeEpisode, animeEpisode)
        ));
    
    return {
      history: animeHistory,
      message: "history by anime",
      error: null
    };
  } catch(error) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to get history by anime.",
      history: null
    }
  }
}