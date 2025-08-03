import { makeRequest, setCache } from "../utils/utils";
import { env } from "../lib/env";
import { redis } from "bun";
import { cacheKeys } from "../lib/constants/cache";
import { AnilistDyanmicData, AnilistStaticData, AnilistResponse, AnilistAnime } from "@better-melon/shared/types";

async function getAnilistStaticData({ anilistId }: { anilistId: AnilistAnime['id'] }): Promise<AnilistStaticData<AnilistAnime>> {
  try {
    const cacheKey = `${cacheKeys.anilist.static(anilistId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for anilist static anime data ID: ${anilistId}`);
      return JSON.parse(cachedData as string) as AnilistAnime;
    }
    
    const { data: { data: anilistAnime } } = await makeRequest<AnilistResponse<"data", { Media: AnilistStaticData<AnilistAnime> }>>(
      env.ANILIST_API_URL,
      {
        benchmark: true,
        name: 'anilist-static-data',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          query: `
            query {
              Media(id: ${anilistId}) {
                id
                title {
                  english
                  romaji
                  native
                }
                format
                bannerImage
                coverImage {
                  medium
                  large
                  extraLarge
                }
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
              } 
            }
          `,
        }
      }, 
    );

    const anime = anilistAnime.Media;
    setCache({ data: anime, key: cacheKey, ttl: 3600, background: true })
    
    return anime;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch anilist static data: Unknown error'}`)
  }
}

async function getAnilistDynamicData({ anilistId }: { anilistId: AnilistAnime['id'] }): Promise<AnilistDyanmicData<AnilistAnime>> {
  try {
    // const cacheKey = `${cacheKeys.anilist.dynamic(anilistId)}`;
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) {
    //   console.log(`Cache hit for anilist dynamic anime data ID: ${anilistId}`);
    //   return JSON.parse(cachedData as string) as AnilistAnime;
    // }

    const { data: { data: anilistAnime } } = await makeRequest<AnilistResponse<"data", { Media: AnilistDyanmicData<AnilistAnime> }>>(
      env.ANILIST_API_URL,
      {
        benchmark: true,
        name: 'anilist-dynamic-data',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          query: `
            query {
              Media(id: ${anilistId}) {
                status
                episodes
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
              }
            }
          `,
        }
      }, 
    );

    const anime = anilistAnime.Media;
    // const ttl = getNextAiringEpisodeTTL(anime.nextAiringEpisode || undefined);
    // await redis.set(cacheKey, JSON.stringify(anime), 'EX', ttl);

    return anime;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch anilist dynamic data: Unknown error'}`)
  }
}

export async function getAnilistAnime({ anilistId }: { anilistId: AnilistAnime['id'] }): Promise<AnilistAnime> {
  const [staticData, dynamicData] = await Promise.all([
    getAnilistStaticData({ anilistId }),
    getAnilistDynamicData({ anilistId })
  ])

  return {
    ...staticData,
    ...dynamicData
  }
}