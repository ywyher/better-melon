import Elysia from "elysia";
import { cors } from '@elysiajs/cors';
import { env } from "./lib/env";
import { indexes } from "./lib/constants/constants";
import { api } from "./routes/api";
import { animeProvider } from "@better-melon/shared/types";

export const server = new Elysia({ serve: { idleTimeout: 255 } })
  .use(cors())
  .use(api)
  .get('/', () => {
    return {
      about: "This API provide the needed data like M3U8 links, japanese subtitle files and dictionary data for better-melon",
      status: '200',
      providers: animeProvider,
      indexes: indexes[0],
      routes: [
        '/api/anime/:anilistId/:episodeNumber/:provider',
        '/api/anime/:anilistId/episodes',

        '/api/indexes/:index/search/:query',
        '/api/dictionary/search/:query',
        '/api/pitch/search/:query',

        '/api/cache/delete',
        '/api/health',
      ]
    }
  })
  .listen(env.PORT)