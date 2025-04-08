import { createAuthClient } from "better-auth/react"
import { emailOTPClient, genericOAuthClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL!,
    plugins: [
        genericOAuthClient(),
        emailOTPClient(),
    ]
})

export const { signIn, signUp, useSession } = createAuthClient()