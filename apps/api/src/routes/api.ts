import Elysia from "elysia";
import { anime } from "./anime";
import { dictionary } from "./dictionary";
import { redis } from "bun";

export const api = new Elysia({ prefix: 'api' })
  .use(dictionary)
  .use(anime)
  .get('/cache/delete', async () => {
    const keys = await redis.keys('*')
    keys.forEach(async (key) => {
      await redis.del(key);
    })
  })
  .get('/health', () => ({ status: 'ok' }))