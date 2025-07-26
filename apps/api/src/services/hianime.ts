import Hianime from '@repo/scraper';
import { redis } from "bun";
import { AnilistAnimeData, AnilistAnimeFormat, AnilistAnimeStatus } from "../types/anilist";
import { AnilistToHiAnime, HianimeAnimeData, HianimeAnimeEpisode, HianimeAnimeEpisodeSources, HianimeAnimeEpisodesResponse, hianimeAnimeResponse, HianimeAnimeResponse, hianimeAnimeStatus, HianimeAnimeStatus, hianimeAnimeType, HianimeAnimeType, HianimeApiResponse, HianimeSearchResponse } from "../types/hianime";
import { getAnilistAnime } from "./anilist";
import { cacheKeys } from "../lib/constants/cache";

const hianime = new Hianime()

async function mapAnilistToHianime(anilistData: AnilistAnimeData): Promise<AnilistToHiAnime> {
  const startTime = performance.now();
  
  try {
    const format = anilistData.format;
    const status = anilistData.status;
    const startDate = anilistData.startDate;
    const endDate = anilistData.endDate;
    const title = anilistData.title.english.toLowerCase().replace(/\s+/g, '+');
    
    const formatMapping: Record<AnilistAnimeFormat, HianimeAnimeType | null> = {
      "TV": "tv",
      "TV_SHORT": "tv",
      "MOVIE": "movie",
      "SPECIAL": "special",
      "OVA": "ova",
      "ONA": "ona",
      "MUSIC": "music",
    };
    const mappedType = formatMapping[format];
    if (!mappedType) {
      throw new Error(`Invalid type: ${format}. Valid HiAnime types are: ${Object.keys(hianimeAnimeType.enum).join(', ')}`)
    }

    const statusMapping: Record<AnilistAnimeStatus, HianimeAnimeStatus | null> = {
      'FINISHED': 'finished-airing',
      "RELEASING": 'currently-airing',
      'NOT_YET_RELEASED': 'not-yet-aired',
      'CANCELLED': null,
      "HIATUS": null
    }
    const mappedStatus = statusMapping[status];
    if (!mappedStatus) {
      throw new Error(`Invalid status: ${status}. Valid HiAnime statuss are: ${Object.keys(hianimeAnimeStatus.enum).join(', ')}`)
    }

    const result = {
      q: title.replace('+', ' '),
      success: true,
      type: mappedType,
      status: mappedStatus,
      startDate: `${startDate.year}-${startDate.month}-${startDate.day}`,
      endDate: mappedStatus == 'finished-airing' ? `${endDate.year}-${endDate.month}-${endDate.day}` : null
    }

    const endTime = performance.now();
    console.log(`mapAnilistToHiAnime execation time: ${(endTime - startTime).toFixed(2)}ms`);

    return result;
  } catch (error) {
    const endTime = performance.now();
    console.log(`mapAnilistToHiAnime failed after ${(endTime - startTime).toFixed(2)}ms`);
    throw new Error(`Failed to map Anilist to HiAnime: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getHianimeAnimeInfo(anilistData: AnilistAnimeData): Promise<HianimeAnimeData> {
  try {
    const cacheKey = `${cacheKeys.hianime.info(anilistData.id)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime ID: ${anilistData.id}`);
      return JSON.parse(cachedData as string) as HianimeAnimeData;
    }
    
    const mapped = await mapAnilistToHianime(anilistData);
    const { endDate, q, startDate, status, type } = mapped;

    console.log(type)

    const { animes } = await hianime.search(q, 1, {
      type,
      status,
      start_date: startDate,
      end_date: endDate ? endDate : undefined,
      language: 'sub'
    })

    if (!animes?.length) {
      throw new Error(`No anime found on HiAnime for: ${q}`);
    }

    const anime = {
      ...animes[0],
      type: animes[0].type?.toLowerCase(),
    } as HianimeAnimeData

    await redis.set(cacheKey, JSON.stringify(anime), "EX", 3600);
    console.log(`Cached hianime data for ID: ${anilistData.id}`);
    return anime;
  } catch (error) {
    console.error(`Error fetching hianime data for ${anilistData.id}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime data: Unknown error'}`);
  }
}

export async function getHianimeAnimeEpisodes(animeId: HianimeAnimeData['id']): Promise<HianimeAnimeEpisodesResponse> {
  try {
    const cacheKey = `${cacheKeys.hianime.episodes(animeId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime ID: ${animeId}`);
      return JSON.parse(cachedData as string) as HianimeAnimeEpisodesResponse;
    }
    
    const data = await hianime.getEpisodes(animeId) as HianimeAnimeEpisodesResponse

    if (!data?.episodes?.length) {
      throw new Error(`No episodes found on HiAnime for: ${animeId}`);
    }
    
    await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);
    return data;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode streaming links: Unknown error'}`);
  }
}

export async function getHianimeAnimeEpisodeSources(episodes: HianimeAnimeEpisode[], episodeNumber: string): Promise<HianimeAnimeEpisodeSources> {
  try {
    const episode = episodes.find(e => e.number === Number(episodeNumber));
    if(!episode) throw new Error("Couldn't find hianime anime episode data")

    const cacheKey = `${cacheKeys.hianime.sources(episode.episodeId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime ID: ${episode.episodeId}`);
      return JSON.parse(cachedData as string) as HianimeAnimeEpisodeSources;
    }
    
    const data = await hianime.getEpisodeSources(episode.episodeId, 'hd-1', 'sub') as HianimeAnimeEpisodeSources
    if (!data.sources?.length) {
      throw new Error(`No episodes found on HiAnime for: ${episode.episodeId}`);
    }

    await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
    return data;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode streaming links: Unknown error'}`);
  }
}

export async function getHianimeAnime(anilistId: string, episodeNumber: string): Promise<HianimeAnimeResponse> {
  console.log(`Starting getHianimeAnime for anilistId: ${anilistId}, episodeNumber: ${episodeNumber}`);
  
  try {
    console.log('Fetching anilist anime data...');
    const anilistAnimeData = await getAnilistAnime(anilistId);
    console.log('Successfully fetched anilist anime data');
    
    console.log('Fetching hianime anime info...');
    const animeData = await getHianimeAnimeInfo(anilistAnimeData);
    if(!animeData) {
      console.error('No anime data found from HiAnime');
      throw new Error("Couldn't find anime data from HiAnime");
    }
    console.log(`Successfully fetched hianime info for ID: ${animeData.id}`);
    
    console.log('Fetching episodes data...');
    const { episodes } = await getHianimeAnimeEpisodes(animeData.id);
    console.log('Successfully fetched episodes data');

    console.log('Fetching streaming links...');
    const sources = await getHianimeAnimeEpisodeSources(episodes, episodeNumber);
    console.log('Successfully fetched streaming links');

    console.log(sources)

    return {
      details: anilistAnimeData,
      sources: sources
    };
  } catch (error) {
    console.error('Error in getHianimeAnime:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime data: Unknown error'}`);
  }
}