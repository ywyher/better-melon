"use server"

import { checkSchema } from "@/components/auth/check";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function checkEmail({ data }: { data: z.infer<typeof checkSchema> }) {
    const email = await db.select().from(user)
        .where(eq(user.email, data.email))

    console.log(email[0])

    if(!email[0]) {
        return {
            verified: false,
            exists: false,
        }
    }

    return {
        verified: email[0].emailVerified,
        exists: email[0] ? true : false
    }
}