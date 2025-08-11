import { redis } from "bun";
import { env } from "../lib/env";
import { makeRequest, setCache } from "../utils/utils";
import { cacheKeys } from "../lib/constants/cache";
import { AnilistAnime, SubtitleEntry, SubtitleFile } from "@better-melon/shared/types";

export async function getSubtitleEntries({ anilistId, shouldCache = true }: { anilistId: AnilistAnime['id'], shouldCache?: boolean }): Promise<SubtitleEntry[]> {
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
    
      setCache({ data: entries, key: cacheKey, ttl: 21600, background: true })
      console.log(`Cached subtitle entries for: ${anilistId}`);
    }

    return entries;
  } catch {
    return []
  }
}

export async function getSubtitleFiles({ anilistData, episodeNumber }: { anilistData: AnilistAnime, episodeNumber: number }): Promise<SubtitleFile[]> {
  try {
    const shouldCache = anilistData.status !== "RELEASING";
    
    const entries = await getSubtitleEntries({ anilistId: anilistData.id, shouldCache });
    
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
      setCache({ data: files, key: cacheKey, ttl: 43200, background: true })
    }

    return files;
  } catch (error) {
    return []
  }
}