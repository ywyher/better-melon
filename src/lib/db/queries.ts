'use server'

import { defaultPlayerSettings } from "@/app/settings/player/constants"
import { defaultSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/constants"
import { defaultWordSettings } from "@/app/settings/word/constants"
import { auth } from "@/lib/auth"
import { defaultGeneralSettings } from "@/lib/constants/settings"
import db from "@/lib/db"
import { account, GeneralSettings, generalSettings, PlayerSettings, playerSettings, SubtitleSettings, subtitleSettings, User, word, wordSettings } from "@/lib/db/schema"
import { env } from "@/lib/env/server"
import { redis } from "@/lib/redis"
import { NHKEntry } from "@/types/nhk"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getAccessToken({ accountId }: {accountId: string}) {
  const [accountData] = await db.select().from(account)
    .where(eq(account.accountId, accountId)) 

  return accountData.accessToken
}

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
      
  return session
}

export async function listAccoutns({ userId }: { userId: User['id'] }) {
  const data = await db.select().from(account).where(eq(account.userId, userId))
  return data
}

export async function getSettingsForEpisode() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) return {
      subtitleSettings: defaultSubtitleSettings,
      generalSettings: defaultGeneralSettings,
      playerSettings: defaultPlayerSettings,
      wordSettings: defaultWordSettings,
    };
        
    const [subtitle] = await db.select().from(subtitleSettings)
        .where(eq(subtitleSettings.userId, session.user.id))

    const [general] = await db.select().from(generalSettings)
        .where(eq(generalSettings.userId, session.user.id))

    const [player] = await db.select().from(playerSettings)
        .where(eq(playerSettings.userId, session.user.id))

    const [word] = await db.select().from(wordSettings)
        .where(eq(wordSettings.userId, session.user.id))

    return {
      subtitleSettings: subtitle || defaultSubtitleSettings,
      generalSettings: general || defaultGeneralSettings,
      playerSettings: player || defaultPlayerSettings,
      wordSettings: word || defaultWordSettings,
    }
}

export async function getAccountProvider(userId: string) {
  const [data] = await db.select().from(account)
    .where(eq(account.userId, userId))

  return data.providerId
}

export async function getPitchAccent(query: string) {
  const res = await fetch(`${env.API_URL}/pitch/search/${query}`)

  if(!res.ok) throw new Error("Pitch not found")

  const pitch = await res.json()
  return pitch.data.entries as NHKEntry[]
}

export async function getCache(key: string, parse: boolean = false) {
  try {
    const cache = await redis.get(key);
    if(!cache) return null;

    if (parse) {
      return JSON.parse(cache);
    }

    return cache;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function getCacheKeys(pattern: string) {
  try {
    const keys = await redis.keys(pattern);

    return keys;
  } catch (error) {
    console.error('Redis keys error:', error);
    return [];
  }
}