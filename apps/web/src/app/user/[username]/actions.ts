'use server'

import db from "@/lib/db"
import { history, User, user, word } from "@/lib/db/schema"
import { HistoryFilters } from "@/types/history"
import { WordFilters } from "@/types/word"
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm"

export async function getProfileUser({ username }: { username: User['name'] }) {
  const [data] = await db.select().from(user)
    .where(eq(user.name, username))

  return data
}

export async function getProfileHistory({ 
  username, 
  filters
}: {
  username: User['name'];
  filters: HistoryFilters
}) {
  const { limit, page, animeTitle, date } = filters
  try {
    const [userData] = await db.select().from(user).where(eq(user.name, username))

    const whereConditions = [eq(history.userId, userData.id)]
    
    if (animeTitle) {
      const searchCondition = or(
        ilike(sql`${history.animeTitle}->>'english'`, `%${animeTitle}%`),
        ilike(sql`${history.animeTitle}->>'romaji'`, `%${animeTitle}%`),
        ilike(sql`${history.animeTitle}->>'native'`, `%${animeTitle}%`)
      );

      if (searchCondition) {
        whereConditions.push(searchCondition);
      }
    }

    // Add date range filtering
    if (date?.from && date?.to) {
      // Convert string dates to Date objects for comparison
      const fromDate = new Date(date.from + 'T00:00:00.000Z');
      const toDate = new Date(date.to + 'T23:59:59.999Z'); // End of day
      
      whereConditions.push(gte(history.updatedAt, fromDate));
      whereConditions.push(lte(history.updatedAt, toDate));
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count for pagination info
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(history)
      .where(and(...whereConditions));

    // Get paginated results
    const list = await db
        .select()
        .from(history)
        .where(and(...whereConditions))
        .orderBy(desc(history.updatedAt))
        .limit(limit)
        .offset(offset);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount.count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      history: list,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount.count,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      },
      message: "history",
      error: null
    };
  } catch(error) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to get history.",
      history: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }
}

export async function getProfileWords({ 
  username,
  filters
}: {
  username: User['name'];
  filters: WordFilters
}) {
  const { date, animeTitle, episodeNumber, limit, page, status, word: query } = filters;
  try {
    const [userData] = await db.select().from(user).where(eq(user.name, username))

    const whereConditions = [eq(word.userId, userData.id)]
    
    if (query) {
      whereConditions.push(sql`${word.word} ~* ${query}`);
    }
    if(animeTitle) {
      const searchCondition = or(
        ilike(sql`${word.animeTitle}->>'english'`, `%${animeTitle}%`),
        ilike(sql`${word.animeTitle}->>'romaji'`, `%${animeTitle}%`),
        ilike(sql`${word.animeTitle}->>'native'`, `%${animeTitle}%`)
      );

      if(searchCondition) {
        whereConditions.push(searchCondition)
      }
    }
    if(episodeNumber) {
      whereConditions.push(eq(word.animeEpisode, episodeNumber))
    }
    if(status) {
      whereConditions.push(eq(word.status, status))
    }
    // Add date range filtering
    if (date?.from && date?.to) {
      // Convert string dates to Date objects for comparison
      const fromDate = new Date(date.from + 'T00:00:00.000Z');
      const toDate = new Date(date.to + 'T23:59:59.999Z'); // End of day
      
      whereConditions.push(gte(word.updatedAt, fromDate));
      whereConditions.push(lte(word.updatedAt, toDate));
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count for pagination info
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(word)
      .where(and(...whereConditions));

    // Get paginated results
    const words = await db
        .select()
        .from(word)
        .where(and(...whereConditions))
        .orderBy(desc(word.updatedAt))
        .limit(limit)
        .offset(offset);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount.count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      words: words,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount.count,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      },
      message: "history",
      error: null
    };
  } catch(error) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "Failed to get words.",
      words: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }
}