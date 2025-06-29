import { cacheKeys } from "@/lib/constants/cache";
import { setCache } from "@/lib/db/mutations";
import { getCache, getPitchAccent } from "@/lib/db/queries";
import { NHKEntry } from "@/types/nhk";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const pitchQueries = createQueryKeys('anime', {
    accent: ({ query }: { query: string }) => ({
      queryKey: ['accent', query],
      queryFn: async () => await getPitchAccent(query)
    }),
    accentChunk: (
      chunk: string[],
      chunkIndex: number, 
      animeId: string,
      subtitleFileName: string,
      delayBetweenRequests: number
    ) => ({
        queryKey: ['accent-chunk', animeId, subtitleFileName, chunkIndex],
        queryFn: async (): Promise<NHKEntry[]> => {
          const query = chunk.join(',');

          try {
            const cache = await getCache(cacheKeys.pitch.accent(animeId, subtitleFileName, chunkIndex));
            if (cache) {
              const cachedEntries = JSON.parse(JSON.parse(cache));
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
          await setCache(cacheKeys.pitch.accent(animeId, subtitleFileName, chunkIndex), JSON.stringify(entries));
          return entries;
        },
    }),
})