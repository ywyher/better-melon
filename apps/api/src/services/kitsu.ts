import { redis } from "bun";
import { AnilistAnimeData, AnilistAnimeStatus } from "../types/anilist";
import { KitsuApiResponse, KitsuAnimeInfo, KitsuAnimeEpisode, KitsuAnimeStatus, AnilistToKitsu, kitsuAnimeStatus, KitsuAnimeEpisodesReponse } from "../types/kitsu";
import { env } from "../lib/env";
import { makeRequest } from "../utils/utils";
import { cacheKeys } from "../lib/constants/cache";

async function mapAnilistToKitsu(anilistData: AnilistAnimeData): Promise<AnilistToKitsu> {
  const startTime = performance.now();
  
  try {
    const status = anilistData.status;
    const startDate = anilistData.startDate;
    const endDate = anilistData.endDate;
    const title = anilistData.title.english.toLowerCase().replace(/\s+/g, '+');
    
    const statusMapping: Record<AnilistAnimeStatus, KitsuAnimeStatus | null> = {
      'FINISHED': 'finished',
      "RELEASING": 'current',
      'NOT_YET_RELEASED': 'unreleased',
      'CANCELLED': null,
      "HIATUS": null
    }
    const mappedStatus = statusMapping[status] as KitsuAnimeStatus;
    if (!mappedStatus) {
      throw new Error(`Invalid status: ${status}. Valid Kitsu statuss are: ${Object.keys(kitsuAnimeStatus.enum).join(', ')}`)
    }

    const pad = (n: number) => n ? String(n).padStart(2, '0') : undefined;

    const result = {
      q: title.replace('+', ' '),
      success: true,
      status: mappedStatus,
      startDate: `${startDate.year}-${pad(startDate.month)}-${pad(startDate.day)}`,
      endDate: mappedStatus == 'finished' ? `${endDate.year}-${pad(endDate.month)}-${pad(endDate.day)}` : null
    }

    const endTime = performance.now();
    console.log(`mapAnilistToHiKitsu execation time: ${(endTime - startTime).toFixed(2)}ms`);

    return result;
  } catch (error) {
    const endTime = performance.now();
    console.log(`mapAnilistToHiKitsu failed after ${(endTime - startTime).toFixed(2)}ms`);
    throw new Error(`Failed to map Anilist to Kitsu: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getKitsuAnimeInfo(anilistData: AnilistAnimeData): Promise<KitsuAnimeInfo> {
  try {
    const cacheKey = cacheKeys.kitsu.info(anilistData.id);
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for kitsu anime ID: ${anilistData.id}`);
      return JSON.parse(cachedData as string) as KitsuAnimeInfo;
    }

    const mapped = await mapAnilistToKitsu(anilistData);
    const { endDate, q, startDate, status } = mapped;

    const { data: { data } } = await makeRequest<KitsuApiResponse<KitsuAnimeInfo[]>>(`
      ${env.KITSU_API_URL}/anime?filter[text]=${q}&filter[status]=${status}
    `, {
      name: 'kitsu-anime-info',
      benchmark: true,
      headers: {
       'Accept': 'application/vnd.api+json',
       'Content-Type': 'application/vnd.api+json'
     }
    })

    if (!data?.length) {
      throw new Error(`No anime found on Kitsu for: ${q}`);
    }

    const anime = data.find((anime) => {
      if(endDate) {
        return anime.attributes.startDate == startDate
        && anime.attributes.endDate == endDate
      }else {
        return anime.attributes.startDate == startDate
      }
    })

    await redis.set(cacheKey, JSON.stringify(anime || data[0]), "EX", 3600);
    console.log(`Cached kitsu anime info for ID: ${anilistData.id}`);
    return anime || data[0]
  } catch (error) {
    console.error(`Error fetching kitsu data for ${anilistData.id}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch kitsu anime data: Unknown error'}`);
  }
}


export async function getKitsuAnimeEpisodes({
  kitsuAnimeId,
  anilistData,
  limit,
  offset
}: {
  kitsuAnimeId: KitsuAnimeInfo['id']
  anilistData: AnilistAnimeData
  limit?: number
  offset?: number
}): Promise<KitsuAnimeEpisodesReponse> {
  try {
    const kitsuLimit = 20; // Maximum allowed by Kitsu API
    const startOffset = offset ?? 0;
    
    const cacheKey = `${cacheKeys.kitsu.episodes({
      animeId: kitsuAnimeId,
      limit: limit || "all",
      offset: startOffset
    })}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for kitsu episodes, anime ID: ${kitsuAnimeId}, limit: ${limit || 'all'}, offset: ${startOffset}`);
      return JSON.parse(cachedData as string) as KitsuAnimeEpisodesReponse;
    }

    const allEpisodes: KitsuAnimeEpisode[] = [];
    let currentOffset = startOffset;
    let hasMorePages = true;
    let totalKitsuCount: number | undefined; // Store the total count from Kitsu (all episodes)

    while (hasMorePages) {
      const { data: { data, meta } } = await makeRequest<KitsuApiResponse<KitsuAnimeEpisode[]>>(`
        ${env.KITSU_API_URL}/anime/${kitsuAnimeId}/episodes?page[limit]=${kitsuLimit}&page[offset]=${currentOffset}
      `, {
        name: 'kitsu-anime-episodes',
        benchmark: true,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      });

      if (!data?.length) {
        if (currentOffset === startOffset) {
          throw new Error(`No episodes found on Kitsu for anime ID: ${kitsuAnimeId} at offset ${startOffset}`);
        }
        break; // No more episodes to fetch
      }

      // Store the total count from the first response
      if (totalKitsuCount === undefined && meta?.count) {
        totalKitsuCount = meta.count;
      }

      // Filter out episodes after nextAiringEpisode if it exists
      const filteredData = (anilistData.nextAiringEpisode && anilistData.nextAiringEpisode.episode)
        ? data.filter(episode => episode.attributes?.number && episode.attributes.number < anilistData.nextAiringEpisode!.episode)
        : data;

      const processedEpisodes = filteredData.map(episode => {
        const processedEpisode = { ...episode };
        
        if (processedEpisode.attributes) {
          if (!processedEpisode.attributes.titles || Object.keys(processedEpisode.attributes.titles).length === 0) {
            processedEpisode.attributes.titles = {
              en: anilistData.title.english || '',
              en_jp: anilistData.title.romaji || anilistData.title.english || '',
              en_us: anilistData.title.english || '',
              ja_jp: anilistData.title.native || anilistData.title.romaji || ''
            };
          }

          if (!processedEpisode.attributes.canonicalTitle) {
            processedEpisode.attributes.canonicalTitle = anilistData.title.english || anilistData.title.romaji || '';
          }

          if (!processedEpisode.attributes.thumbnail) {
            const fallbackImage = anilistData.bannerImage || anilistData.coverImage.large;
            if (fallbackImage) {
              processedEpisode.attributes.thumbnail = {
                original: fallbackImage,
              };
            }
          }
        }
        
        return processedEpisode;
      });

      allEpisodes.push(...processedEpisodes);

      // Check if we've reached the user-specified limit
      if (limit && allEpisodes.length >= limit) {
        console.log(`Reached limit of ${limit}, stopping fetch`);
        // Trim to exact count if we exceeded it
        allEpisodes.splice(limit);
        break;
      }

      // If we filtered out episodes, we might need to stop early
      if (anilistData.nextAiringEpisode && filteredData.length < data.length) {
        console.log(`Stopped fetching at episode ${anilistData.nextAiringEpisode.episode - 1} due to nextAiringEpisode limit`);
        break;
      }

      // Check if there are more pages
      currentOffset += kitsuLimit;
      
      // Multiple ways to determine if there are more pages:
      if (meta?.count) {
        // If total count is available
        hasMorePages = currentOffset < meta.count;
      } else if (data.length < kitsuLimit) {
        // If we got fewer episodes than the limit, we've reached the end
        hasMorePages = false;
      } else {
        // Fallback: assume there might be more if we got exactly the limit
        hasMorePages = data.length === kitsuLimit;
      }

      console.log(`Fetched ${data.length} episodes (${allEpisodes.length}/${totalKitsuCount || '?'} total) with Kitsu API limit: ${kitsuLimit}, offset: ${currentOffset - kitsuLimit}`);
    }

    console.log(`Successfully fetched ${allEpisodes.length} episodes for anime ID: ${kitsuAnimeId} (limit: ${limit || 'all'}, starting offset: ${startOffset})`);

    // Calculate the current aired episode count
    let currentAiredCount: number;
    
    if (anilistData.nextAiringEpisode && anilistData.nextAiringEpisode.episode) {
      // If there's a next airing episode, current aired count is nextEpisode - 1
      currentAiredCount = anilistData.nextAiringEpisode.episode - 1;
    } else if (anilistData.status === 'FINISHED') {
      // If the anime is finished, use the total episode count from AniList or Kitsu
      currentAiredCount = anilistData.episodes || totalKitsuCount || allEpisodes.length;
    } else {
      // For ongoing series without nextAiringEpisode info, use the actual fetched count
      // This might happen for series that are airing but don't have next episode data
      currentAiredCount = allEpisodes.length;
    }

    const result: KitsuAnimeEpisodesReponse = {
      episodes: allEpisodes,
      count: currentAiredCount,
    };

    // Set cache TTL based on nextAiringEpisode
    const cacheTtl = anilistData.nextAiringEpisode 
      ? Math.max(anilistData.nextAiringEpisode.timeUntilAiring, 60) // Minimum 60 seconds to avoid too frequent updates
      : 3600;

    await redis.set(cacheKey, JSON.stringify(result), "EX", cacheTtl);
    console.log(`Cached kitsu episodes for anime ID: ${kitsuAnimeId} with TTL: ${cacheTtl}s (limit: ${limit || 'all'}, offset: ${startOffset})`);
    console.log(`Current aired episodes: ${currentAiredCount}, Total planned episodes: ${totalKitsuCount || 'unknown'}`);

    return result;
  } catch (error) {
    console.error(`Error fetching kitsu episodes for ${kitsuAnimeId}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch kitsu anime episodes: Unknown error'}`);
  }
}