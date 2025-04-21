import { getEpisodesData, getStreamingData, getSubtitleEntries, getSubtitleFiles } from "@/app/watch/[id]/[ep]/actions";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const player = createQueryKeys('player', {
    episodeData: (animeId: string) => ({
        queryKey: ['player', 'episodesData', animeId],
        queryFn: async () => await getEpisodesData(animeId),
    }),
    streamingData: (episodeId: string) => ({
        queryKey: ['player', 'streamingData', episodeId],
        queryFn: async () => await getStreamingData(episodeId || ""),
    }),
    subtitleEntries: (animeId: string) => ({
        queryKey: ['player', 'subtitleEntries', animeId],
        queryFn: async () => await getSubtitleEntries(animeId),
    }),
    subtitleFiles: (entryId: number, episodeNumber: number) => ({
        queryKey: ['player', 'subtitleFiles', entryId, episodeNumber],
        queryFn: async () => {
          if(!entryId || !episodeNumber) return;
          return await getSubtitleFiles(entryId, episodeNumber)
        },
    })
})