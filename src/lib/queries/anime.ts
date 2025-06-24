import { cacheKeys } from "@/lib/constants/cache";
import { setCache } from "@/lib/db/mutations";
import { getCache } from "@/lib/db/queries";
import { env } from "@/lib/env/client";
import { GET_ANIME } from "@/lib/graphql/queries";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const animeQueries = createQueryKeys('anime', {
    data: (animeId: string) => ({
        queryKey: ['data', animeId],
        queryFn: async () => {
          const cached = await getCache(`${cacheKeys.anime.info(animeId)}`);
          if (cached) {
            return JSON.parse(cached);
          }
          
          const raw = await fetch(env.NEXT_PUBLIC_ANILIST_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              query: GET_ANIME.loc?.source.body,
              variables: {
                id: Number(animeId) 
              }
            })
          });
          const data = await raw.json()
          await setCache(`${cacheKeys.anime.info(animeId)}`, data);
          return data;
        },
    }),
})