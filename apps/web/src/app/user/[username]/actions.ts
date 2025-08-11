'use server'

import db from "@/lib/db"
import { history, User, user } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

export async function getProfileUser({ username }: { username: User['name'] }) {
  const [data] = await db.select().from(user)
    .where(eq(user.name, username))

  return data
}

export async function getProfileHistory({ username }: { username: User['name'] }) {
  try {
    const [userData] = await db.select().from(user).where(eq(user.name, username))

    const list = await db
        .select()
        .from(history)
        .where(eq(history.userId, userData.id))
        .orderBy(desc(history.updatedAt))
        // .limit(limit ?? Number.MAX_SAFE_INTEGER);

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