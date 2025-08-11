import { env } from "@/lib/env/client";
import { Anime } from "@/types/anime";
import { AnimeProvider, StreamingData } from "@better-melon/shared/types";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const streamingQueries = createQueryKeys('streaming', {
    data: ({
      animeId,
      episodeNumber,
      provider = 'hianime'
    }: {
      animeId: Anime['id']; 
      episodeNumber: number;
      provider?: AnimeProvider
    }) => ({
        queryKey: ['data', animeId, episodeNumber],
        queryFn: async (): Promise<StreamingData> => {
          try {
            const dataRaw = await fetch(
              `${env.NEXT_PUBLIC_API_URL}/anime/${animeId}/${episodeNumber}/${provider}`
            );

            if (!dataRaw.ok) {
              throw new Error(`API responded with status: ${dataRaw.status}`);
            }
            const { data, message, success } = await dataRaw.json() as {
              success: boolean,
              data: StreamingData,
              message: string,
            };
            
            if (!success) {
              throw new Error(message || 'API returned failure');
            }

            if (!data) {
              throw new Error('Invalid data structure returned from API');
            }
            
            
            return data;
          } catch (error) {
            throw new Error('Invalid data structure returned from API');
            // return {
            //   success: false,
            //   message
            // }
          }
        }
    }),
})