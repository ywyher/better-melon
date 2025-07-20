import { cacheKeys } from "@/lib/constants/cache";
import { setCache } from "@/lib/db/mutations";
import { getCache } from "@/lib/db/queries";
import { env } from "@/lib/env/client";
import { GET_ANIME, GET_ANIME_LIST } from "@/lib/graphql/queries";
import { Anime, AnimeInListVariables } from "@/types/anime";
import { KitsuAnimeEpisode } from "@/types/kitsu";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const animeQueries = createQueryKeys('anime', {
  staticData: (animeId: string) => ({
      queryKey: ['static-data', animeId],
      queryFn: async () => {
        try {
          const cached = await getCache(`${cacheKeys.anime.staticData(animeId)}`);
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

          if(!raw.ok) throw new Error("Couldn't fetch anime static data")

          const { data } = await raw.json()
          await setCache(`${cacheKeys.anime.staticData(animeId)}`, data);
          return data;
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Failed to fetch anime static data"
          console.error(msg)
        }
      },
  }),
  topTrending: () => ({
      queryKey: ['top-airing'],
      queryFn: async () => {
        try {
          const cached = await getCache(`${cacheKeys.anime.topTrending()}`);
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
              query: GET_ANIME_LIST.loc?.source.body,
              variables: {
                sort: 'TRENDING_DESC',
                includeBanner: true,
                includeDescription: true,
              }
            })
          });

          if(!raw.ok) throw new Error("Couldn't fetch top-airing data")

          const { data } = await raw.json()
          await setCache(`${cacheKeys.anime.topTrending()}`, data, 3600);
          return data;
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Failed to fetch anime data"
          console.error(msg)
        }
      },
  }),
  list: (variables: AnimeInListVariables) => ({
      queryKey: ['list', variables],
      queryFn: async () => {
        try {
          const cached = await getCache(`${cacheKeys.anime.list(variables)}`);
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
              query: GET_ANIME_LIST.loc?.source.body,
              variables: variables
            })
          });

          if(!raw.ok) throw new Error("Couldn't fetch top-airing data")

          const { data } = await raw.json()
          await setCache(`${cacheKeys.anime.list(variables)}`, data, 3600);
          return data;
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Failed to fetch anime data"
          console.error(msg)
        }
      },
  }),
  episodesMetadata: ({ animeId, limit, offset }: {
    animeId: Anime['id'];
    limit?: number;
    offset?: number
  }) => ({
    queryKey: ['episodes-metadata', animeId, limit, offset],
    queryFn: async () => {
      // already have caching on the api side
      try {
        const raw = await fetch(`${env.NEXT_PUBLIC_API_URL}/anime/${animeId}/episodes?limit=${limit}&offset=${offset}`)
        if(!raw.ok) throw new Error(`Error while fetching anime episodes metadata: ${raw.statusText}`)

        const data: KitsuAnimeEpisode[] = await raw.json()
        return data;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to fetch anime data"
        console.error(msg)
      }
    }
  })
})