'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSessionServer() {
    const data = await auth.api.getSession({
        headers: await headers()
    })

    if(!data?.session) return {
        data: null,
        error: "No user"
    }
    
    return {
        data: data,
        error: null
    }
}

export async function loginOnServer() {

    const data = await auth.api.signInAnonymous({
        headers: await headers(),
    })
    
    if(!data?.token) return {
        message: null,
        error: "Couldn't login"
    }

    return {
        message: "Logged in",
        error: null
    }
}