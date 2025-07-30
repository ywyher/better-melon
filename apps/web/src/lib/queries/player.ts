import { getEpisodeData } from "@/app/watch/[id]/[ep]/actions";
import { Anime } from "@/types/anime";
import { EpisodeData } from "@/types/episode";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const playerQueries = createQueryKeys('player', {
    episodeData: (animeId: Anime['id'], episodeNumber: number) => ({
        queryKey: ['episodesData', animeId, episodeNumber],
        queryFn: async (): Promise<EpisodeData> => {
          const episodeData = await getEpisodeData(animeId, episodeNumber, 'hianime')

          return episodeData as EpisodeData
        }
    }),
})