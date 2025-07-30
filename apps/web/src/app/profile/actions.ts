'use server'

import { editProfileSchema } from "@/app/profile/_components/edit-profile";
import db from "@/lib/db";
import { User, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

type EditProfileProps = { data: z.infer<typeof editProfileSchema>, userId: User['id'] }

export async function editProfile({ data, userId }: EditProfileProps) { 
    const [updatedUser] = await db.update(user).set({
        // email: data.email,
        name: data.username,
        updatedAt: new Date()
    }).where(eq(user.id, userId)).returning({ id: user.id })

    if(!updatedUser.id) {
        return {
            message: null,
            error: "Failed to edit user data..."
        }
    }

    return {
        message: "User data updated...",
        error: null
    }
}