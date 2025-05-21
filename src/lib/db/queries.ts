'use server'

import { defaultPlayerSettings } from "@/app/settings/player/constants"
import { defaultSubtitleSettings } from "@/app/settings/subtitle/_subtitle-settings/constants"
import { auth } from "@/lib/auth"
import { defaultGeneralSettings } from "@/lib/constants/settings"
import db from "@/lib/db"
import { account, GeneralSettings, generalSettings, PlayerSettings, playerSettings, SubtitleSettings, subtitleSettings, User } from "@/lib/db/schema"
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
  const data = await db.select().from(account).where(eq(account.userId, "dnldZfdJG1SHuJL9yRFe3wCYhhls1GDb"))
  return data
}

export async function getSettingsForEpisode() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user.id) return {
      subtitleSettings: defaultSubtitleSettings,
      generalSettings: defaultGeneralSettings,
      playerSettings: defaultPlayerSettings,
    };
        
    const [subtitle] = await db.select().from(subtitleSettings)
        .where(eq(subtitleSettings.userId, session.user.id))

    const [general] = await db.select().from(generalSettings)
        .where(eq(generalSettings.userId, session.user.id))

    const [player] = await db.select().from(playerSettings)
        .where(eq(playerSettings.userId, session.user.id))

    return {
      subtitleSettings: subtitle || defaultSubtitleSettings,
      generalSettings: general || defaultGeneralSettings,
      playerSettings: player || defaultPlayerSettings,
    }
}