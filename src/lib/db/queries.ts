'use server'

import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { account, User } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
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