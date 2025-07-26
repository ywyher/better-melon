import { AnilistAnimeData, AnilistAnimeDyanmicData, AnilistAnimeResponse, AnilistAnimeStaticData } from "../types/anilist"
import { makeRequest } from "../utils/utils";
import { env } from "../lib/env";
import { redis } from "bun";
import { cacheKeys } from "../lib/constants/cache";

async function getAnilistAnimeStaticData({ anilistId }: { anilistId: AnilistAnimeData['id'] }): Promise<AnilistAnimeStaticData> {
  try {
    const cacheKey = `${cacheKeys.anilist.staticData(anilistId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for anilist static anime data ID: ${anilistId}`);
      return JSON.parse(cachedData as string) as AnilistAnimeData;
    }
    
    const { data: { data: anilistAnimeData } } = await makeRequest<AnilistAnimeResponse<AnilistAnimeStaticData>>(
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
                idMal
                bannerImage
                coverImage {
                  large
                  medium
                }
                title {
                  english
                  romaji
                  native
                }
                format
                description
                genres
                season
                seasonYear
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
                averageScore
                isAdult
              } 
            }
          `,
        }
      }, 
    );

    const animeData = anilistAnimeData.Media;
    
    await redis.set(cacheKey, JSON.stringify(animeData), 'EX', 3600);
    
    return animeData;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch anilist data: Unknown error'}`)
  }
}

async function getAnilistAnimeDynamicData({ anilistId }: { anilistId: AnilistAnimeData['id'] }): Promise<AnilistAnimeDyanmicData> {
  try {
    const { data: { data: anilistAnimeData } } = await makeRequest<AnilistAnimeResponse<AnilistAnimeDyanmicData>>(
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
                  timeUntilAiring
                }
              }
            }
          `,
        }
      }, 
    );

    const animeData = anilistAnimeData.Media;
    return animeData;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch anilist data: Unknown error'}`)
  }
}

export async function getAnilistAnime(anilistId: AnilistAnimeData['id']): Promise<AnilistAnimeData> {
  const staticData = await getAnilistAnimeStaticData({ anilistId })
  const dynamicData = await getAnilistAnimeDynamicData({ anilistId })

  return {
    ...staticData,
    ...dynamicData
  }
}