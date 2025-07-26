import { createAuthClient } from "better-auth/react"
import { anonymousClient, emailOTPClient, genericOAuthClient } from "better-auth/client/plugins"
import { env } from "@/lib/env/client"

export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL!,
    plugins: [
        genericOAuthClient(),
        emailOTPClient(),
        anonymousClient()
    ]
})

export const { signIn, signUp, useSession, getSession } = createAuthClient()

