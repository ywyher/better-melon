import { redis } from "bun";
import { KitsuApiResponse, AnilistToKitsu, KitsuStatus, KitsuAnime, kitsuStatus, KitsuResponse } from "../types/kitsu";
import { env } from "../lib/env";
import { makeRequest, setCache } from "../utils/utils";
import { cacheKeys } from "../lib/constants/cache";
import { AnilistAnime, AnilistStatus, KitsuEpisode, KitsuEpisodesReponse } from "@better-melon/shared/types";
import { getNextAiringEpisodeTTL } from "@better-melon/shared/utils";

async function mapAnilistToKitsu({ anilistData }: { anilistData: AnilistAnime }): Promise<AnilistToKitsu> {
  const startTime = performance.now();
  
  try {
    const status = anilistData.status;
    const startDate = anilistData.startDate;
    const endDate = anilistData.endDate;
    const title = anilistData.title.english.toLowerCase().replace(/\s+/g, '+');
    
    const statusMapping: Record<AnilistStatus, KitsuStatus | null> = {
      'FINISHED': 'finished',
      "RELEASING": 'current',
      'NOT_YET_RELEASED': 'unreleased',
      'CANCELLED': null,
      "HIATUS": null
    }
    const mappedStatus = statusMapping[status] as KitsuStatus;
    if (!mappedStatus) {
      throw new Error(`Invalid status: ${status}. Valid Kitsu statuss are: ${Object.keys(kitsuStatus.enum).join(', ')}`)
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

export async function getKitsuInfo({ anilistData }: { anilistData: AnilistAnime }): Promise<KitsuAnime> {
  try {
    const cacheKey = cacheKeys.kitsu.info(String(anilistData.id));
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for kitsu anime ID: ${anilistData.id}`);
      return JSON.parse(cachedData as string) as KitsuAnime;
    }

    const mapped = await mapAnilistToKitsu({ anilistData });
    const { endDate, q, startDate, status } = mapped;

    const { data: { data } } = await makeRequest<KitsuApiResponse<KitsuAnime[]>>(`
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

    setCache({ data: anime || data[0], key: cacheKey, ttl: 3600, background: true })
    console.log(`Cached kitsu anime info for ID: ${anilistData.id}`);
    return anime || data[0]
  } catch (error) {
    console.error(`Error fetching kitsu data for ${anilistData.id}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch kitsu anime info: Unknown error'}`);
  }
}

export async function getKitsuEpisode({
  kitsuAnimeId,
  episodeNumber
}: {
  kitsuAnimeId: KitsuAnime['id']
  episodeNumber: number
}): Promise<KitsuEpisode> {
    const cacheKey = `${cacheKeys.kitsu.episode({
      animeId: kitsuAnimeId,
      episodeNumber
    })}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`Cache hit for kitsu episodes, anime ID: ${kitsuAnimeId}, episodeNumber: ${episodeNumber}`);
      return JSON.parse(cachedData as string) as KitsuEpisode;
    }

    const { data: { data } } = await makeRequest<KitsuApiResponse<KitsuEpisode[]>>(`
      ${env.KITSU_API_URL}/anime/${kitsuAnimeId}/episodes?filter[number]=${episodeNumber}
    `, {
      name: 'kitsu-anime-episodes',
      benchmark: true,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });

    const episode = data[0]
    
    setCache({ data: episode, key: cacheKey, ttl: 3600, background: true })
    return episode;
}

export async function getKitsuAnime({
  anilistData,
  episodeNumber
}: {
  anilistData: AnilistAnime,
  episodeNumber: number
}): Promise<KitsuResponse> {
  console.log(`Starting getKitsu for anilistId: ${anilistData.id}, episodeNumber: ${episodeNumber}`);
  
  try {
    console.log('Fetching kitsu anime info...');
    const info = await getKitsuInfo({ anilistData });
    if(!info) {
      console.error('No anime info found from Kitsu');
      throw new Error("Couldn't find anime info from Kitsu");
    }
    console.log(`Successfully fetched kitsu info for ID: ${info.id}`);
    
    console.log('Fetching episode data...');
    const episode = await getKitsuEpisode({ 
      episodeNumber,
      kitsuAnimeId: info.id
    });
    console.log('Successfully fetched episode data');

    return {
      anime: info,
      episode
    };
  } catch (error) {
    console.error('Error in getKitsu:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch kitsu data: Unknown error'}`);
  }
}

export async function getKitsuEpisodes({
  kitsuAnimeId,
  anilistData,
  limit,
  offset
}: {
  kitsuAnimeId: KitsuAnime['id']
  anilistData: AnilistAnime
  limit?: number
  offset?: number
}): Promise<KitsuEpisodesReponse> {
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
      return JSON.parse(cachedData as string) as KitsuEpisodesReponse;
    }

    const allEpisodes: KitsuEpisode[] = [];
    let currentOffset = startOffset;
    let hasMorePages = true;
    let totalKitsuCount: number | undefined; // Store the total count from Kitsu (all episodes)

    while (hasMorePages) {
      const { data: { data, meta } } = await makeRequest<KitsuApiResponse<KitsuEpisode[]>>(`
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
            const fallbackImage = anilistData.bannerImage || anilistData.coverImage.extraLarge || anilistData.coverImage.large;
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

    const result: KitsuEpisodesReponse = {
      episodes: allEpisodes,
      count: currentAiredCount,
    };

    // Set cache TTL based on nextAiringEpisode
    const cacheTtl = getNextAiringEpisodeTTL(anilistData.nextAiringEpisode || undefined)

    setCache({ data: result, key: cacheKey, ttl: cacheTtl, background: true })
    console.log(`Current aired episodes: ${currentAiredCount}, Total planned episodes: ${totalKitsuCount || 'unknown'}`);

    return result;
  } catch (error) {
    console.error(`Error fetching kitsu episodes for ${kitsuAnimeId}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch kitsu anime episodes: Unknown error'}`);
  }
}