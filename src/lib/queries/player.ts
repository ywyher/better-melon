import { getEpisodesData, getStreamingData, getSubtitleEntries, getSubtitleFiles } from "@/app/watch/[id]/[ep]/actions";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const playerQueries = createQueryKeys('player', {
    episodeData: (animeId: string) => ({
        queryKey: ['episodesData', animeId],
        queryFn: async () => await getEpisodesData(animeId),
    }),
    streamingData: (episodeId: string) => ({
        queryKey: ['streamingData', episodeId],
        queryFn: async () => await getStreamingData(episodeId || ""),
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