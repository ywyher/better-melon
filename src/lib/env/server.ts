import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    APP_URL: z.string().url(),
    ENV: z.enum(['DEVELOPMENT', 'PRODUCTION']),
    DATABASE_URL: z.string().url(),

    BETTER_AUTH_SECRET: z.string().min(1),
    
    API_URL: z.string().url(),
    
    ANILIST_ID: z.string().min(1),
    ANILIST_SECRET: z.string().min(1),
    ANILIST_REDIRECT_URL: z.string().url(),
    
    RESEND_FROM_EMAIL: z.string().email().optional(),
    RESEND_API_KEY: z.string().optional(),
  },
  experimental__runtimeEnv: process.env,
});