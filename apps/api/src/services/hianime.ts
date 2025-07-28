import Hianime from '@repo/scraper';
import { redis } from "bun";
import { AnilistAnime } from "../types/anilist";
import { AnilistToHiAnime, HianimeResponse } from "../types/hianime";
import { getAnilistAnime } from "./anilist";
import { cacheKeys } from "../lib/constants/cache";
import { AnilistFormat, AnilistStatus, HianimeAnime, HianimeEpisode, HianimeEpisodeSources, hianimeFormat, HianimeFormat, hianimeStatus, HianimeStatus } from '@better-melon/shared/types';

const hianime = new Hianime()

async function mapAnilistToHianime(anilistData: AnilistAnime): Promise<AnilistToHiAnime> {
  const startTime = performance.now();
  
  try {
    const format = anilistData.format;
    const status = anilistData.status;
    const startDate = anilistData.startDate;
    const endDate = anilistData.endDate;
    const title = anilistData.title.english.toLowerCase().replace(/\s+/g, '+');
    
    const formatMapping: Record<AnilistFormat, HianimeFormat | null> = {
      "TV": "TV",
      "MOVIE": "MOVIE",
      "SPECIAL": "SPECIAL",
      "OVA": "OVA",
      "ONA": "ONA",
      "MUSIC": "MUSIC",
      "TV_SHORT": null,
      "MANGA": null,
      'NOVEL': null,
      'ONE_SHOT': null
    };
    const mappedFormat = formatMapping[format];
    if (!mappedFormat) {
      throw new Error(`Invalid format: ${format}. Valid Hianime types are: ${Object.keys(hianimeFormat.enum).join(', ')}`)
    }

    const statusMapping: Record<AnilistStatus, HianimeStatus | null> = {
      'FINISHED': 'FINISHED',
      "RELEASING": 'RELEASING',
      'NOT_YET_RELEASED': 'NOT_YET_RELEASED',
      'CANCELLED': null,
      "HIATUS": null
    }
    const mappedStatus = statusMapping[status];
    if (!mappedStatus) {
      throw new Error(`Invalid status: ${status}. Valid HiAnime statuss are: ${Object.keys(hianimeStatus.enum).join(', ')}`)
    }

    const result = {
      q: title.replace('+', ' '),
      success: true,
      format: mappedFormat,
      status: mappedStatus,
      startDate,
      endDate: status == 'FINISHED' ? endDate : null
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

export async function getHianimeAnimeInfo(anilistData: AnilistAnime): Promise<HianimeAnime> {
  try {
    const cacheKey = `${cacheKeys.hianime.info(anilistData.id)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime ID: ${anilistData.id}`);
      return JSON.parse(cachedData as string) as HianimeAnime;
    }
    
    const mapped = await mapAnilistToHianime(anilistData);
    const { endDate, q, startDate, status, format } = mapped;
    
    const { animes } = await hianime.search({
      q,
      page: 1,
      filters: {
        // other filters may change between hinaime and anilist so we dont use them
        format,
        startDate,
        endDate: endDate ?? undefined,
        language: 'SUB',
        status,
      }
    })

    if (!animes?.length) {
      throw new Error(`No anime found on HiAnime for: ${q}`);
    }

    const anime = animes[0] as HianimeAnime

    await redis.set(cacheKey, JSON.stringify(anime), "EX", 3600);
    console.log(`Cached hianime data for ID: ${anilistData.id}`);
    return anime;
  } catch (error) {
    console.error(`Error fetching hianime data for ${anilistData.id}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime data: Unknown error'}`);
  }
}

export async function getHianimeAnimeEpisodes(animeId: HianimeAnime['id']): Promise<HianimeEpisode[]> {
  try {
    const cacheKey = `${cacheKeys.hianime.episodes(animeId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime episode ID: ${animeId}`);
      return JSON.parse(cachedData as string) as HianimeEpisode[];
    }
    
    const episodes = await hianime.getEpisodes({ animeId })
    if (!episodes.length) {
      throw new Error(`No episodes found on HiAnime for: ${animeId}`);
    }
    await redis.set(cacheKey, JSON.stringify(episodes), "EX", 3600);
    return episodes;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode streaming links: Unknown error'}`);
  }
}

export async function getHianimeAnimeEpisodeSources(episodes: HianimeEpisode[], episodeNumber: string): Promise<HianimeEpisodeSources> {
  try {
    const episode = episodes.find(e => e.number === Number(episodeNumber));
    if(!episode) throw new Error(`Couldn't find hianime anime episode`)

    const cacheKey = `${cacheKeys.hianime.sources(String(episode.id))}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime episode sources episodeID: ${episode.id}`);
      return JSON.parse(cachedData as string) as HianimeEpisodeSources;
    }
    
    const sources = await hianime.getEpisodeSources({
      episodeId: episode.id,
      server: undefined,
      fallback: true
    })
    if (!sources) {
      throw new Error(`No episodes found on HiAnime for: ${episode.id}`);
    }

    await redis.set(cacheKey, JSON.stringify(sources), "EX", 300);
    return sources;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode streaming links: Unknown error'}`);
  }
}

export async function getHianimeAnime(anilistId: AnilistAnime['id'], episodeNumber: string): Promise<HianimeResponse> {
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
    const episodes = await getHianimeAnimeEpisodes(animeData.id);
    console.log('Successfully fetched episodes data');

    console.log('Fetching streaming links...');
    const sources = await getHianimeAnimeEpisodeSources(episodes, episodeNumber);
    console.log('Successfully fetched streaming links');

    return {
      details: anilistAnimeData,
      sources: sources
    };
  } catch (error) {
    console.error('Error in getHianimeAnime:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime data: Unknown error'}`);
  }
}