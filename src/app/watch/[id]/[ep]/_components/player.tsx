"use client"

import { MediaPlayer, MediaProvider, TextTrack } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Poster } from '@vidstack/react';
import { Track } from "@vidstack/react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { SubtitleFile, SubtitleFormat } from '@/types/subtitle';
import { AnimeEpisodeData, AnimeStreamingData } from '@/types/anime';
import { selectSubtitleFile } from '@/app/watch/[id]/[ep]/funcs';

type PlayerProps = { 
    streamingData: AnimeStreamingData;
    episode: AnimeEpisodeData;
    subtitleFiles: SubtitleFile[];
}

export default function Player({ streamingData, episode, subtitleFiles }: PlayerProps) {
    const [videoSrc, setVideoSrc] = useState("");
    const [isLoading, setIsLoading] = useState(true)

    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const setActiveSubtitleFile = useWatchStore((state) => state.setActiveSubtitleFile);
    
    useEffect(() => {
        const url = encodeURIComponent(streamingData?.sources[0].url);
        setVideoSrc(`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${url}`);
        
        
        if (!activeSubtitleFile && subtitleFiles.length > 0) {
            const selected = selectSubtitleFile(subtitleFiles)
            if(!selected) return;
            setActiveSubtitleFile({
                name: selected.name,
                url: selected.url,
                last_modified: selected.last_modified,
                size: selected.size
            });
        }
        
        setIsLoading(false);
    }, [subtitleFiles, streamingData, setActiveSubtitleFile, activeSubtitleFile]);

    const handleTrackChange = useCallback((track: TextTrack | null) => {
        if (!track || activeSubtitleFile?.name === track.label) return;
    
        const matchedSub = subtitleFiles.find(s => s.name === track.label);
        if (matchedSub) {
            setActiveSubtitleFile({
                name: matchedSub.name,
                url: matchedSub.url,
                last_modified: matchedSub.last_modified,
                size: matchedSub.size
            });
        }
    }, [subtitleFiles, setActiveSubtitleFile, activeSubtitleFile]);
    

    if (isLoading) return <Skeleton className="w-full aspect-video" />;

    return (
        <div className="h-fit">
            <MediaPlayer
                title={episode.title}
                src={videoSrc}
                onTextTrackChange={handleTrackChange}
                crossOrigin="anonymous"
            >
                <MediaProvider>
                    <Poster
                        className="vds-poster"
                        src={episode.image}
                        alt={episode.title}
                    />
                    
                    {activeSubtitleFile && subtitleFiles.map((sub) => (
                        <Track
                            key={sub.url}
                            src={sub.url}
                            kind="subtitles"
                            label={sub.name}
                            type={sub.url.split('.').pop() as SubtitleFormat}
                            lang="jp-JP"
                        />
                    ))}
                    {streamingData.subtitles.map((sub) => (
                        <Track
                            key={sub.url}
                            src={`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${encodeURIComponent(sub.url)}`}
                            kind="subtitles"
                            label={sub.lang}
                            type={sub.url.split('.').pop() as SubtitleFormat}
                        />
                    ))}
                </MediaProvider>
                <DefaultVideoLayout
                    thumbnails={`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${encodeURIComponent("https://files.vidstack.io/sprite-fight/thumbnails.vtt")}`}
                    icons={defaultLayoutIcons} 
                />
            </MediaPlayer>
        </div>
    );
}