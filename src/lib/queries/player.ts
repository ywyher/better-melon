import { getCompleteData, getEpisodesData, getStreamingData, getSubtitleEntries, getSubtitleFiles } from "@/app/watch/[id]/[ep]/actions";
import { parseSubtitleToJson, selectSubtitleFile } from "@/lib/subtitle";
import { getExtension } from "@/lib/utils";
import { SubtitleFormat } from "@/types/subtitle";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const playerQueries = createQueryKeys('player', {
    episodeData: (animeId: string, episodeNumber: number) => ({
        queryKey: ['episodesData', animeId, episodeNumber],
        queryFn: async () => {
          const data = await getCompleteData(animeId, episodeNumber)

          const selectedFile = selectSubtitleFile({
            files: data.subtitleFiles,
            preferredFormat: 'srt'
          })
      
          if(!selectedFile) throw new Error("Failed to select file")
      
          const japaneseTranscription = await parseSubtitleToJson({ 
            source: selectedFile.url,
            format: getExtension(selectedFile.name) as SubtitleFormat,
            transcription: 'japanese'
          });

          return {
            ...data,
            japaneseTranscription
          }
        },
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