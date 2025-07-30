import { cacheKeys } from "@/lib/constants/cache";
import { setCache } from "@/lib/db/mutations";
import { getCache, getPitchAccent } from "@/lib/db/queries";
import { Anime } from "@/types/anime";
import { NHKEntry } from "@/types/nhk";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const pitchQueries = createQueryKeys('anime', {
    accent: ({ query }: { query: string }) => ({
      queryKey: ['accent', query],
      queryFn: async () => await getPitchAccent(query)
    }),
    accentChunk: ({
      chunk,
      chunkIndex,
      animeId,
      subtitleFileName,
      delayBetweenRequests,
    }: {
      chunk: string[],
      chunkIndex: number, 
      animeId: Anime['id'],
      subtitleFileName: string,
      delayBetweenRequests: number
    }) => ({
        queryKey: ['accent-chunk', animeId, subtitleFileName, chunkIndex],
        queryFn: async (): Promise<NHKEntry[]> => {
          const query = chunk.join(',').replace(/[\/\\]/g, '');
          const cacheKey = cacheKeys.pitch.accent(animeId, subtitleFileName, chunkIndex)

          try {
            const cache = await getCache(cacheKey);
            if (cache) {
              const cachedEntries = JSON.parse(cache);
              if (Array.isArray(cachedEntries)) {
                return cachedEntries;
              }
            }
          } catch (parseError) {
            console.error('Error parsing cached data:', parseError);
          }

          // Add artificial delay to prevent overwhelming the API
          if (chunkIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
          }

          // Fetch from API
          const entries = await getPitchAccent(query);

          // Cache the result
          setCache(cacheKey, entries)
            .catch(err => console.error('Cache write failed:', err));
          return entries;
        },
    }),
})