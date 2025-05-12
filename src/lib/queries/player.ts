import { getEpisodeContext } from "@/app/watch/[id]/[ep]/actions/index.actions";
import { getSubtitleEntries, getSubtitleFiles } from "@/app/watch/[id]/[ep]/actions/subtitle.actions";
import { selectSubtitleFile } from "@/lib/subtitle/utils";
import { AnimeEpisodeContext } from "@/types/anime";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const playerQueries = createQueryKeys('player', {
    episodeData: (animeId: string, episodeNumber: number) => ({
        queryKey: ['episodesData', animeId, episodeNumber],
        queryFn: async (): Promise<AnimeEpisodeContext> => {
          const episodeContext = await getEpisodeContext(animeId, episodeNumber)

          const selectedFile = selectSubtitleFile({
            files: episodeContext.data.subtitles,
            preferredFormat: 'srt'
          })
      
          if(!selectedFile) throw new Error("Failed to select file")
      
          return episodeContext as AnimeEpisodeContext
        },
    }),
    subtitleEntries: (animeId: string) => ({
        queryKey: ['subtitleEntries', animeId],
        queryFn: async () => await getSubtitleEntries(animeId),
    }),
    subtitleFiles: (entryId: number, episodeNumber: number) => ({
        queryKey: ['subtitleFiles', entryId, episodeNumber],
        queryFn: async () => {
          if(!entryId || !episodeNumber) return;
          return await getSubtitleFiles(entryId, episodeNumber)
        },
    })
})