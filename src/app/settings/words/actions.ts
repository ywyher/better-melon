'use server'

import db from "@/lib/db"
import { ensureAuthenticated } from "@/lib/db/mutations"
import { Word, word as wordTable } from "@/lib/db/schema"
import { generateId } from "better-auth"
import { eq, inArray } from "drizzle-orm"

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

export async function addWord({ word, status }: { word: Word['word'], status: Word['status'] }) {
  try {
    const { userId, error } = await ensureAuthenticated()
    if(error || !userId) throw new Error(error || "Must be authenticated")

    const [entry] = await db.select().from(wordTable)
      .where(eq(wordTable.word, word))
    if(entry) throw new Error("Word already exists")

    const id = generateId()
    await db.insert(wordTable).values({
      id,
      word,
      status,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return {
      message: "Word added.",
      error: null
    }
  } catch (error: unknown) {
      return {
        message: null,
        error: error instanceof Error ? error.message : "Failed to add a new word",
      }
    }
}