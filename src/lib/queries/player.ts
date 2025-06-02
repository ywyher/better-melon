import { getEpisodeData } from "@/app/watch/[id]/[ep]/actions/index.actions";
import { AnimeEpisodeData } from "@/types/anime";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const playerQueries = createQueryKeys('player', {
    episodeData: (animeId: string, episodeNumber: number) => ({
        queryKey: ['episodesData', animeId, episodeNumber],
        queryFn: async (): Promise<AnimeEpisodeData> => {
          const episodeData = await getEpisodeData(animeId, episodeNumber, 'hianime')

          return episodeData as AnimeEpisodeData
        }
    }),
})