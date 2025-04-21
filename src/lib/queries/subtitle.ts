import { parseSubtitleToJson } from "@/lib/subtitle";
import { ActiveSubtitleFile, SubtitleTranscription } from "@/types/subtitle";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const subtitle = createQueryKeys('subtitle', {
    subtitleCues: (transcription: SubtitleTranscription, activeSubtitleFile: ActiveSubtitleFile) => ({
        queryKey: ['subtitle-cues', transcription, activeSubtitleFile],
        queryFn: async () => {
            if(activeSubtitleFile) {
                const format = activeSubtitleFile?.source == 'remote' 
                ? activeSubtitleFile!.file.url.split('.').pop() as "srt" | "vtt"
                : activeSubtitleFile!.file.name.split('.').pop() as "srt" | "vtt";
                
                return await parseSubtitleToJson({ 
                    source: activeSubtitleFile?.source == 'remote' 
                        ? activeSubtitleFile.file.url 
                        : activeSubtitleFile.file,
                    format,
                    transcription: transcription
                })
            }
            else throw new Error("Couldn't get the file")
        },
    })
})