"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { getCache } from "@/lib/db/queries";
import { user, User } from "@/lib/db/schema";
import { redis } from "@/lib/redis";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function ensureAuthenticated() {
    try {
        const headersList = await headers();
        const currentUser = await auth.api.getSession({ headers: headersList });
        
        let userId: string;
        
        if (!currentUser || !currentUser.user.id) {
            const anon = await auth.api.signInAnonymous();
            
            if (!anon?.user?.id) {
                return {
                    userId: null,
                    message: null,
                    isAnon: true,
                    error: "Not authenticated nor were we able to authenticate you as an anonymous user. Please register."
                };
            }
            
            userId = anon.user.id;
        } else {
            userId = currentUser.user.id;
        }
    
        return {
            userId: userId,
            error: null,
            message: null,
            isAnon: false
        }
    } catch(error) {
        return {
            userId: null,
            error: error instanceof Error ? error.message : 'Failed to ensure user authentication',
            message: null,
            isAnon: false
        }
    }
}

export async function updateUser({ data, userId }: { data: User, userId: User['id'] }) { 
    const [updatedUser] = await db.update(user).set({
        ...data,
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

export async function setCache<T>(key: string, value: T, ttlSeconds?: number) {
    const serializedValue = JSON.stringify(value);
    
    let results;
    if (ttlSeconds) {
        results = await redis.setex(`${key}`, ttlSeconds, serializedValue);
    } else {
        results = await redis.set(`${key}`, serializedValue);
    }
    
    return {
        success: results === 'OK'
    };
}

export async function updateCache<T>(key: string, updates: T): Promise<void> {
  try {
    const existing = await getCache(`${key}`, true);
    if (existing) {
      const updated = { ...existing, ...updates };
      await setCache(key, updated);
    }
  } catch (error) {
    console.error('Redis update error:', error);
  }
}