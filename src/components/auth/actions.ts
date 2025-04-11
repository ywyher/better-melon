"use server"

import { AuthIdentifier } from "@/components/auth/auth";
import { checkSchema } from "@/components/auth/check";
import db from "@/lib/db";
import { User, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function checkEmail({ data, identifier }: { data: z.infer<typeof checkSchema>, identifier: AuthIdentifier }) {

    const [result] = await db.select().from(user)
        .where(eq(identifier == 'email' ? user.email : user.name, data.identifier))

    if(!result) {
        return {
            verified: false,
            exists: false,
            error: "Couldn't tell"
        }
    }

    return {
        verified: result.emailVerified,
        exists: result ? true : false,
        error: null
    }
}

export async function getEmailByUsername({ username }: { username: User['name'] }) {
    const [result] = await db.select().from(user)
        .where(eq(user.name, username))

    if(!result) return;

    return result.email
}