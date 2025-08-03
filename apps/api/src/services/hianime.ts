import Hianime from '@repo/scraper';
import { redis } from "bun";
import { AnilistToHiAnime, HianimeResponse } from "../types/hianime";
import { cacheKeys } from "../lib/constants/cache";
import { AnilistAnime, AnilistFormat, AnilistStatus, HianimeAnime, HianimeEpisode, HianimeEpisodeServers, HianimeEpisodeSources, hianimeFormat, HianimeFormat, hianimeStatus, HianimeStatus } from '@better-melon/shared/types';
import { setCache } from '../utils/utils';

const hianime = new Hianime()

async function mapAnilistToHianime({ anilistData }: { anilistData: AnilistAnime }): Promise<AnilistToHiAnime> {
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

export async function getHianimeInfo({ anilistData }: { anilistData: AnilistAnime }): Promise<HianimeAnime> {
  try {
    const cacheKey = `${cacheKeys.hianime.info(anilistData.id)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime ID: ${anilistData.id}`);
      return JSON.parse(cachedData as string) as HianimeAnime;
    }
    
    const mapped = await mapAnilistToHianime({ anilistData });
    const { endDate, q, startDate, status, format } = mapped;
    
    const { animes } = await hianime.search({
      q,
      page: 1,
      filters: {
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

    setCache({ data: anime, key: cacheKey, ttl: 3600, background: true })
    console.log(`Cached hianime data for ID: ${anilistData.id}`);
    return anime;
  } catch (error) {
    console.error(`Error fetching hianime data for ${anilistData.id}:`, error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime data: Unknown error'}`);
  }
}

export async function getHianimeEpisodes({ animeId }: { animeId: HianimeAnime['id'] }): Promise<HianimeEpisode[]> {
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

    setCache({ data: episodes, key: cacheKey, ttl: 3600, background: true })
    return episodes;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode streaming links: Unknown error'}`);
  }
}

export async function getHianimeEpisodeServers({ episodeId }: { episodeId: HianimeEpisode['id'] }): Promise<HianimeEpisodeServers> {
  try {
    const cacheKey = `${cacheKeys.hianime.servers(episodeId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime episode servers episodeID: ${episodeId}`);
      return JSON.parse(cachedData as string) as HianimeEpisodeServers;
    }
    
    const servers = await hianime.getEpisodeServers({ episodeId: episodeId })

    if (!servers) {
      throw new Error(`No episode servers found on Hianime for: ${episodeId}`);
    }

    setCache({ data: servers, key: cacheKey, ttl: 300, background: true })
    return servers;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode servers: Unknown error'}`);
  }
}

export async function getHianimeEpisodeSources({
  episodeId,
  servers
}: {
  episodeId: HianimeEpisode['id']
  servers: HianimeEpisodeServers
}): Promise<HianimeEpisodeSources> {
  try {
    const cacheKey = `${cacheKeys.hianime.sources(episodeId)}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for hianime anime episode sources episodeID: ${episodeId}`);
      return JSON.parse(cachedData as string) as HianimeEpisodeSources;
    }
    
    const sources = await hianime.getEpisodeSources({
      episodeId: episodeId,
      server: servers.sub[0] || servers.sub[1],
      fallback: true
    })

    if (!sources) {
      throw new Error(`No episodes sources found on HiAnime for: ${episodeId}`);
    }

    setCache({ data: sources, key: cacheKey, ttl: 300, background: true })
    return sources;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime anime episode sources: Unknown error'}`);
  }
}

export async function getHianimeAnime({
  anilistData,
  episodeNumber
}: {
  anilistData: AnilistAnime,
  episodeNumber: number
}): Promise<HianimeResponse> {
  console.log(`Starting getHianimeAnime for anilistId: ${anilistData.id}, episodeNumber: ${episodeNumber}`);
  
  try {
    console.log('Fetching hianime anime info...');
    const info = await getHianimeInfo({ anilistData });
    if(!info) {
      console.error('No anime data found from HiAnime');
      throw new Error("Couldn't find anime data from HiAnime");
    }
    console.log(`Successfully fetched hianime info for ID: ${info.id}`);
    
    console.log('Fetching episodes data...');
    const episodes = await getHianimeEpisodes({ animeId: info.id });
    console.log('Successfully fetched episodes data');

    const episode = episodes.find(e => e.number === episodeNumber);
    const episodeId = episode?.id
    if(!episode || !episodeId) throw new Error(`Couldn't find hianime anime episode`)

    console.log('Fetching episode servers...');
    const servers = await getHianimeEpisodeServers({
      episodeId
    });
    console.log('Successfully fetched episode servers');

    console.log('Fetching sources...');
    const sources = await getHianimeEpisodeSources({
      episodeId,
      servers
    });
    console.log('Successfully fetched sources');

    return {
      anime: info,
      episodes,
      servers,
      sources: sources
    };
  } catch (error) {
    console.error('Error in getHianimeAnime:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch hianime data: Unknown error'}`);
  }
}