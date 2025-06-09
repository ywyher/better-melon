import { env } from '@/lib/env/server';
import { Redis } from "ioredis"

export const redis = new Redis({
  port: Number(env.REDIS_PORT),
});