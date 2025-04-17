"use server";

import db from "@/lib/db";
import { user, User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function deleteUser({ userId }: { userId: User['id'] }) {
    const result = await db.delete(user).where(eq(user.id, userId))

    if(!result) return {
        error: "Couldn't delete account, try again later",
        message: null,
    }

    return {
        message: "Account deleted successfully",
        error: null
    }
}