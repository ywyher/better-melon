"use client"

import Settings from "@/app/watch/[id]/[ep]/_components/settings/settings";
import SubtitlePanel from "@/app/watch/[id]/[ep]/_components/panel/panel";
import Player from "@/app/watch/[id]/[ep]/_components/player/player";
import { filterSubtitleFiles, selectSubtitleFile } from "@/app/watch/[id]/[ep]/funcs";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import GoBack from "@/app/watch/[id]/[ep]/_components/goback";
import { AnimeEpisodeData, AnimeStreamingData } from "@/types/anime";
import { SubtitleFile } from "@/types/subtitle";
import { useEffect } from "react";

type WatchContainerProps = {
    episode: AnimeEpisodeData;
    streamingData: AnimeStreamingData;
    subtitleFiles: SubtitleFile[];
    episodesLength: number;
}

export default function WatchContainer({
    episode,
    streamingData,
    subtitleFiles,
    episodesLength
}: WatchContainerProps) {
    const englishSubtitleUrl = useWatchStore((state) => state.englishSubtitleUrl);
    const setEnglishSubtitleUrl = useWatchStore((state) => state.setEnglishSubtitleUrl);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const setActiveSubtitleFile = useWatchStore((state) => state.setActiveSubtitleFile);

    useEffect(() => {
        if(!streamingData) return;

        if (!activeSubtitleFile && subtitleFiles.length > 0) {
            const selected = selectSubtitleFile(subtitleFiles);
            if(selected) {
                setActiveSubtitleFile({
                    source: 'remote',
                    file: {
                        name: selected.name,
                        url: selected.url,
                        last_modified: selected.last_modified,
                        size: selected.size
                    }
                });
            }
        }

        if (!englishSubtitleUrl) {
            const englishSub = streamingData.subtitles.find((s) => s.lang === 'English')?.url || "";
            setEnglishSubtitleUrl(englishSub);
        }
    }, [streamingData, subtitleFiles]);
    
    return (
        <div className="flex flex-row gap-10 container mx-auto px-4 py-6">
            <div className="flex flex-col gap-3">
                <GoBack />
                <Player 
                    episode={episode} 
                    streamingData={streamingData} 
                    subtitleFiles={filterSubtitleFiles(subtitleFiles)} 
                    episodesLength={episodesLength}
                />
                <Settings episodesLength={episodesLength} />
            </div>
            {subtitleFiles && (
                <SubtitlePanel
                    subtitleFiles={filterSubtitleFiles(subtitleFiles)}
                />
            )}
        </div>
    )
}