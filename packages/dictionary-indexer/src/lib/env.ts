import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    HOST: z.string().url(),
    PORT: z.string(),
    API_KEY: z.string()
  },
  runtimeEnv: process.env,
});