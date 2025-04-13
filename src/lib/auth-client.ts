import { createAuthClient } from "better-auth/react"
import { anonymousClient, emailOTPClient, genericOAuthClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL!,
    plugins: [
        genericOAuthClient(),
        emailOTPClient(),
        anonymousClient()
    ]
})

export const { signIn, signUp, useSession, getSession } = createAuthClient()