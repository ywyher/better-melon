import { cacheKeys } from "@/lib/constants/cache";
import { setCache } from "@/lib/db/mutations";
import { getCache } from "@/lib/db/queries";
import { env } from "@/lib/env/client";
import { GET_ANIME, GET_ANIME_LIST } from "@/lib/graphql/queries";
import { sortObject } from "@/lib/utils/utils";
import { Anime, AnimeListQueryVariableKeys, AnimeQueryVariableKeys, AnimeQueryVariables, AnimeListQueryVariables } from "@/types/anime";
import { KitsuAnimeEpisodesReponse } from "@/types/kitsu";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { AnilistResponse } from "@better-melon/shared/types";
import { ApiResponse } from "@/types/api";

export const animeQueries = createQueryKeys('anime', {
  data: ({ animeId, name, variables }: { animeId: Anime['id'], name: AnimeQueryVariableKeys, variables: AnimeQueryVariables }) => ({
      queryKey: ['data', animeId, sortObject({ object: variables, output: 'string' })],
      queryFn: async <T>() => {
        try {
          const cached = await getCache(`${cacheKeys.anime.data({ animeId, name, variables })}`);
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
              variables: variables as AnimeQueryVariables
            })
          });

          if(!raw.ok) throw new Error("Couldn't fetch anime static data")

          const { data }: { data: AnilistResponse<"Media", Anime> } = await raw.json()
          
          if(name == 'dynamic') {
            // this caches the next airing episode data which make it inaccurate
            // const ttl = getNextAiringEpisodeTTL(data.Media.nextAiringEpisode || undefined);
            // await setCache(`${cacheKeys.anime.data({ animeId, name, variables })}`, data, ttl);
            return data;
          }

          await setCache(`${cacheKeys.anime.data({ animeId, name, variables })}`, data);
          return data;
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Failed to fetch anime static data"
          return {
            success: false,
            message: msg
          };
        }
      },
  }),
  list: ({ name, variables }: { name: AnimeListQueryVariableKeys; variables: AnimeListQueryVariables }) => ({
      queryKey: ['list', sortObject({ object: variables, output: 'string' })],
      queryFn: async () => {
        try {
          const cached = await getCache(`${cacheKeys.anime.list({ name, variables })}`);
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
          await setCache(`${cacheKeys.anime.list({ name, variables })}`, data, 3600);
          return data;
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Failed to fetch anime data"
          return {
            success: false,
            message: msg
          };
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

        const data: ApiResponse<KitsuAnimeEpisodesReponse> = await raw.json()
        return data;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to fetch anime data"
        return {
          success: false,
          message: msg
        };
      }
    }
  })
})