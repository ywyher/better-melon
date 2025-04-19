'use client'

import { getSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/actions";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { usePlayerStore } from "@/lib/stores/player-store";
import { subtitleTranscriptions } from "@/lib/constants";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { useQueries } from "@tanstack/react-query";
import TranscriptionsContainer from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions-container";

export default function SubtitleTranscriptions() {
    const englishSubtitleUrl = usePlayerStore((state) => state.englishSubtitleUrl) || "";
    const activeSubtitleFile = usePlayerStore((state) => state.activeSubtitleFile);

    const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);

    const addSubtitleStylesInStore = useSubtitleStylesStore((state) => state.addStyles);

    const subtitleQueries = useQueries({
        queries: subtitleTranscriptions.filter(transcription => activeTranscriptions.includes(transcription)).map(transcription => ({
            queryKey: ['subs', transcription, transcription === 'english' 
                ? englishSubtitleUrl 
                : activeSubtitleFile?.source == 'remote'
                    ? activeSubtitleFile?.file.url 
                    :  activeSubtitleFile?.file
            ],
            queryFn: async () => {
                if ((transcription !== 'english' && activeSubtitleFile?.source == 'remote' ? !activeSubtitleFile?.file.url : !activeSubtitleFile?.file) || 
                    (transcription === 'english' && !englishSubtitleUrl)) {
                    throw new Error(`Couldn't get the file for ${transcription} subtitles`);
                }

                const source = transcription === 'english' 
                ? englishSubtitleUrl 
                : activeSubtitleFile?.source == 'remote' 
                    ? activeSubtitleFile!.file.url 
                    : activeSubtitleFile!.file;
                
                const format = transcription === 'english' 
                    ? englishSubtitleUrl.split('.').pop() as "srt" | "vtt"
                        : activeSubtitleFile?.source == 'remote' 
                            ? activeSubtitleFile!.file.url.split('.').pop() as "srt" | "vtt"
                            : activeSubtitleFile!.file.name.split('.').pop() as "srt" | "vtt";

                let styles = await getSubtitleStyles({ transcription });
                
                if(JSON.stringify(styles) == JSON.stringify(defaultSubtitleStyles)) {
                    styles = await getSubtitleStyles({ transcription: 'all' });
                    addSubtitleStylesInStore('all', styles)
                }else {
                    addSubtitleStylesInStore(transcription, styles)
                }
                
                const cues = await parseSubtitleToJson({ 
                    source,
                    format,
                    transcription
                });
                
                return {
                    transcription,
                    format,
                    cues
                };
            },
            staleTime: Infinity,
            enabled:
                (transcription === 'english' ? !!englishSubtitleUrl : 
                    activeSubtitleFile?.source == 'remote' 
                        ? !!activeSubtitleFile?.file.url 
                        : !!activeSubtitleFile?.file)
                            && activeTranscriptions.includes(transcription),
        }))
    });

    const isLoading = subtitleQueries.some(query => query.isLoading);

    if (isLoading) return <></>;

    return (
        <TranscriptionsContainer
            subtitleQueries={subtitleQueries}
        />
    );
}