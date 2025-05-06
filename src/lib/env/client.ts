import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_PROXY_URL: z.string().url(),
    NEXT_PUBLIC_ANKI_CONNECT_URL: z.string().url()
  },
  runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_PROXY_URL: process.env.NEXT_PUBLIC_PROXY_URL,
    NEXT_PUBLIC_ANKI_CONNECT_URL: process.env.NEXT_PUBLIC_ANKI_CONNECT_URL,
  },
});