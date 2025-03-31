"use client"

import { EpisodeData, JimakuFile, StreamingData } from "@/app/watch/[id]/[ep]/types";
import { MediaPlayer, MediaProvider, TextTrack } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Poster } from '@vidstack/react';
import { Track } from "@vidstack/react";
import { filterFiles } from "@/app/watch/[id]/[ep]/funcs";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";

type TPlayer = { 
    streamingData: StreamingData;
    episodeData: EpisodeData
    japaneseSubs: JimakuFile[]
}

export default function Player({ streamingData, episodeData, japaneseSubs }: TPlayer) {
    const [uri, setUri] = useState("")
    const [filteredJpSubs, setFilteredJpSubs] = useState<JimakuFile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const sub = useWatchStore((state) => state.sub)
    const setSub = useWatchStore((state) => state.setSub)
    
    // Set up the player when component mounts
    useEffect(() => {
        const url = encodeURIComponent(streamingData?.sources[0].url);
        setUri(`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${url}`);
        
        // Filter the Japanese subs
        const filtered = filterFiles(japaneseSubs);
        setFilteredJpSubs(filtered);
        
        // If no subtitle is selected yet and we have filtered subs, select the first one
        if (!sub && filtered.length > 0) {
            setSub({
                name: filtered[0].name,
                url: filtered[0].url,
                last_modified: filtered[0].last_modified,
                size: filtered[0].size
            });
        }
        
        setIsLoading(false);
    }, [japaneseSubs, streamingData, setSub, sub]);

    useEffect(() => {
        console.log(sub)
    }, [sub])

    // Handle track change event
    const handleTrackChange = useCallback((track: TextTrack | null) => {
        if (!track || sub?.name === track.label) return;
    
        // Find the matching subtitle from filtered Japanese subs
        const matchedSub = filteredJpSubs.find(s => s.name === track.label);
        if (matchedSub) {
            setSub({
                name: matchedSub.name,
                url: matchedSub.url,
                last_modified: matchedSub.last_modified,
                size: matchedSub.size
            });
        }
    }, [filteredJpSubs, setSub, sub]);
    

    if (isLoading) return <Skeleton className="w-full aspect-video" />;

    return (
        <div className="h-fit">
            <MediaPlayer
                title={episodeData.title}
                src={uri}
                onTextTrackChange={handleTrackChange}
                crossOrigin="anonymous"
            >
                <MediaProvider>
                    <Poster
                        className="vds-poster"
                        src={episodeData.image}
                        alt={episodeData.title}
                    />
                    {sub && filteredJpSubs.map((jpSub) => (
                        <Track
                            key={jpSub.url}
                            src={jpSub.url}
                            kind="subtitles"
                            label={jpSub.name}
                            type={jpSub.url.split('.').pop() as "vtt" | "srt" | "ass"}
                            lang="jp-JP"
                            default={jpSub.name == sub.name}
                        />
                    ))}
                    {streamingData.subtitles.map((extSub) => (
                        <Track
                            key={extSub.url}
                            src={`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${encodeURIComponent(extSub.url)}`}
                            kind="subtitles"
                            label={extSub.lang}
                            type={extSub.url.split('.').pop() as "vtt" | "srt" | "ass"}
                            lang="en-US"
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