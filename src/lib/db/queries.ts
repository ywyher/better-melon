'use server'

import db from "@/lib/db"
import { account } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getAccessToken({ accountId }: {accountId: string}) {
  const [accountData] = await db.select().from(account)
    .where(eq(account.accountId, accountId)) 

  return accountData.accessToken
}