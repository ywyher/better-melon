"use client"

import { MediaPlayer, MediaPlayerInstance, MediaProvider, TextTrack } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Poster } from '@vidstack/react';
import { Track } from "@vidstack/react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useDebounce } from 'use-debounce';

import { useCallback, useEffect, useRef, useState } from "react";
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
    const player = useRef<MediaPlayerInstance>(null);
    const [videoSrc, setVideoSrc] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
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

    // Refs to track time values and animation frame
    const latestTimeRef = useRef(0);
    const lastUpdatedTimeRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);
    const significantChangeThreshold = 0.5; // Update when time changes by 0.5 seconds
    const setDuration = useWatchStore((state) => state.setDuration);
    const currentTime = useWatchStore((state) => state.currentTime);
    const setCurrentTime = useWatchStore((state) => state.setCurrentTime);
    
    // Local state for debouncing
    const [localTime, setLocalTime] = useState(0);
    const [debouncedTime] = useDebounce(localTime, 250);
    
    useEffect(() => {
        console.log(currentTime)
    }, [currentTime])

    useEffect(() => {
        setCurrentTime(debouncedTime);
    }, [debouncedTime, setCurrentTime]);

    // RequestAnimationFrame setup
    // it will handle updating the state for us
    useEffect(() => {
        // Function to update local state in sync with browser's animation frame
        const updateTimeState = () => {
            const currentTime = latestTimeRef.current;
            
            // Only update if time has changed significantly
            if (Math.abs(currentTime - lastUpdatedTimeRef.current) >= significantChangeThreshold) {
                lastUpdatedTimeRef.current = currentTime;
                setLocalTime(currentTime);
            }
            
            // Continue the animation frame loop
            rafIdRef.current = requestAnimationFrame(updateTimeState);
        };

        // Start the RAF loop
        rafIdRef.current = requestAnimationFrame(updateTimeState);

        // Cleanup
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, []);

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
    
    const onLoadedMetadata = () => {
        if (player.current) {
            setDuration(player.current.duration);
        }
    }
    
    // Let RAF handle when to actually update the state
    const handleTimeUpdate = (time: { currentTime: number }) => {
        latestTimeRef.current = time.currentTime;
    };

    if (isLoading) return <Skeleton className="w-full aspect-video" />;

    return (
        <div className="h-fit">
            <MediaPlayer
                title={episode.title}
                src={videoSrc}
                ref={player}
                onTextTrackChange={handleTrackChange}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                load='eager'
                posterLoad='eager'
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
                <DefaultAudioLayout icons={defaultLayoutIcons} />
                <DefaultVideoLayout
                    thumbnails={`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${encodeURIComponent("https://files.vidstack.io/sprite-fight/thumbnails.vtt")}`}
                    icons={defaultLayoutIcons} 
                />
            </MediaPlayer>
        </div>
    );
}