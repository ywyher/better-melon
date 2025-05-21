import { getEpisodeData } from "@/app/watch/[id]/[ep]/actions/index.actions";
import { selectSubtitleFile } from "@/lib/subtitle/utils";
import { AnimeEpisodeData } from "@/types/anime";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const playerQueries = createQueryKeys('player', {
    episodeData: (animeId: string, episodeNumber: number) => ({
        queryKey: ['episodesData', animeId, episodeNumber],
        queryFn: async (): Promise<AnimeEpisodeData> => {
          const episodeData = await getEpisodeData(animeId, episodeNumber, 'hianime')

          const selectedFile = selectSubtitleFile({
            files: episodeData.subtitles,
            preferredFormat: 'srt'
          })
      
          if(!selectedFile) throw new Error("Failed to select file")
      
          return episodeData as AnimeEpisodeData
        },
    }),
})