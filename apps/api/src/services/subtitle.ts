import { redis } from "bun";
import { env } from "../lib/env";
import { AnilistAnimeData } from "../types/anilist";
import { makeRequest } from "../utils/utils";
import { cacheKeys } from "../lib/constants/cache";
import { SubtitleEntry, SubtitleFile } from "../types/jiamku";

export async function getSubtitleEntries(anilistId: string, shouldCache: boolean = true): Promise<SubtitleEntry[]> {
  try {
    const cacheKey = `${cacheKeys.subtitle.entries(anilistId)}`;
    if (shouldCache) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for subtitle entries: ${anilistId}`);
        return JSON.parse(cachedData as string) as SubtitleEntry[];
      }
      console.log(`Cache miss for subtitle entries: ${anilistId}`);
    } else {
      console.log(`Skipping cache for releasing anime: ${anilistId}`);
    }

    const { data: entries } = await makeRequest<SubtitleEntry[]>(
      `${env.JIMAKU_URL}/api/entries/search?anilist_id=${anilistId}`, {
      headers: { 
        Authorization: env.JIMAKU_KEY
      },
      benchmark: true,
      name: 'subtitle-entries',
    });

    if (shouldCache && entries?.length) {
      await redis.set(cacheKey, JSON.stringify(entries), "EX", 21600); // 6 hours
      console.log(`Cached subtitle entries for: ${anilistId}`);
    }

    return entries;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch subtitle entries: Unknown error'}`)
  }
}

export async function getSubtitleFiles(anilistData: AnilistAnimeData, episodeNumber: string): Promise<SubtitleFile[]> {
  try {
    const shouldCache = anilistData.status !== "RELEASING";
    
    const entries = await getSubtitleEntries(String(anilistData.id), shouldCache);
    
    if (!entries?.length) {
      throw new Error(`No subtitle entries found for anime: ${anilistData.id}`);
    }
    
    const cacheKey = `${cacheKeys.subtitle.files(entries[0].id, episodeNumber)}`;
    
    // Check cache only if caching is enabled
    if (shouldCache) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for subtitle files: ${entries[0].id} episode ${episodeNumber}`);
        return JSON.parse(cachedData as string) as SubtitleFile[];
      }
      console.log(`Cache miss for subtitle files: ${entries[0].id} episode ${episodeNumber}`);
    } else {
      console.log(`Skipping cache for releasing anime: ${anilistData.id} episode ${episodeNumber}`);
    }
    
    const { data: files } = await makeRequest<SubtitleFile[]>(
      `${env.JIMAKU_URL}/api/entries/${entries[0].id}/files?episode=${episodeNumber}`, {
      headers: { 
        Authorization: env.JIMAKU_KEY
      },
      benchmark: true,
      name: 'subtitle-files',
    });

    if (shouldCache && files?.length) {
      await redis.set(cacheKey, JSON.stringify(files), "EX", 43200); // 12 hours
      console.log(`Cached subtitle files for: ${entries[0].id} episode ${episodeNumber}`);
    }

    return files;
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : 'Failed to fetch subtitle files: Unknown error'}`)
  }
}