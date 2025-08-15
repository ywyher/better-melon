'use server'

import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { Word, word as wordTable } from "@/lib/db/schema"
import { Anime } from "@/types/anime"
import { NHKPitch } from "@/types/nhk"
import { AnilistTitle } from "@better-melon/shared/types"
import { generateId } from "better-auth"
import { and, eq, inArray } from "drizzle-orm"

export async function getWord(word: string) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(error || !userId) throw new Error(error || "Must be authenticated")
    
    const [wordData] = await db.select().from(wordTable)
      .where(and(
        eq(wordTable.word, word),
        eq(wordTable.userId, userId)
      ))

    return {
      word: wordData,
      message: "Word",
      error: null
    }
  } catch (error: unknown) {
    return {
      message: null,
      word: null,
      error: error instanceof Error ? error.message : "Failed to get word",
    }
  }
}

export async function getWords({ status }: { status?: Word['status'] }) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(error || !userId) throw new Error(error || "Must be authenticated")
    
    const conditions = [
      eq(wordTable.userId, userId),
      status !== undefined ? eq(wordTable.status, status) : undefined
    ].filter(Boolean)

    const words = await db.select().from(wordTable)
      .where(and(...conditions))

    return {
      message: "Words",
      words,
      error: null
    }
  } catch (error: unknown) {
    return {
      message: null,
      words: [],
      error: error instanceof Error ? error.message : "Failed to get words",
    }
  }
}

export async function addWordsBulk({ words, status }: { words: string[], status: Word['status'] }) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(error || !userId) throw new Error(error || "Must be authenticated")

    const existingWords = await db.select({ word: wordTable.word })
      .from(wordTable)
      .where(inArray(wordTable.word, words))
    
    const existingWordsSet = new Set(existingWords.map(w => w.word))
    const newWords = words.filter(word => !existingWordsSet.has(word))
    
    if (newWords.length === 0) {
      return {
        message: "All words already exist",
        error: null,
        added: 0,
        skipped: words.length
      }
    }

    const wordsToInsert = newWords.map(word => ({ 
      id: generateId(),
      word,
      status: status,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })) as Word[]
    await db.insert(wordTable).values(wordsToInsert)

    return {
      message: `Added ${newWords.length} words`,
      error: null,
      added: newWords.length,
      skipped: words.length - newWords.length
    }
  } catch (error: unknown) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to add words",
      added: 0,
      skipped: 0
    }
  }
}

export async function handleWord({ word, status, pitches, animeId, animeTitle, timeRange, animeEpisode, animeBanner }: { 
  word: Word['word'];
  status: Word['status'];
  pitches: NHKPitch[] | null;
  timeRange: Word['timeRange'];
  animeTitle: AnilistTitle;
  animeId: Anime['id'];
  animeEpisode: number;
  animeBanner: string
}) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(error || !userId) throw new Error(error || "Must be authenticated")

    const [entry] = await db.select().from(wordTable)
      .where(eq(wordTable.word, word))

    if(entry) {
      await db.update(wordTable).set({
        status,
        updatedAt: new Date()
      })
      
      return {
        message: `Word set as ${status}.`,
        error: null
      }
    }
    
    const id = generateId()
    await db.insert(wordTable).values({
      id,
      word,
      status,
      pitches,
      timeRange,
      animeId: String(animeId),
      animeEpisode: Number(animeEpisode),
      animeTitle,
      animeBanner,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return {
      message: `Word set as ${status}.`,
      error: null
    }
  } catch (error: unknown) {
      return {
        message: null,
        error: error instanceof Error ? error.message : "Failed to add a new word",
      }
    }
}