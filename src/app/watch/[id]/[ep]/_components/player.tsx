"use client"

import { MediaPlayer, MediaPlayerInstance, MediaProvider, TextTrack, useMediaState } from '@vidstack/react';
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
    const [isInitializing, setIsInitializing] = useState(true);
    const [isVideoReady, setIsVideoReady] = useState(false);

    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const setActiveSubtitleFile = useWatchStore((state) => state.setActiveSubtitleFile);
    const setPlayer = useWatchStore((state) => state.setPlayer);

    useEffect(() => {
        setPlayer(player)
    }, [player])

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
        
        setIsInitializing(false);
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
    
    // Track when the video is actually ready to play
    const handleCanPlay = () => {
        setIsVideoReady(true);
    };

    // Using a timeout as additional fallback for very fast loading videos
    useEffect(() => {
        if (!isInitializing && !isVideoReady) {
            const readyTimer = setTimeout(() => {
                setIsVideoReady(true);
            }, 3000); // Fallback timeout of 3 seconds
            
            return () => clearTimeout(readyTimer);
        }
    }, [isInitializing, isVideoReady]);

    return (
        <div className="relative w-full h-full">
            {/* Skeleton that takes exact same space as the player */}
            {(!isVideoReady || isInitializing) && (
                <div className="
                    absolute inset-0 z-10
                    flex flex-col
                    w-full h-full 
                ">
                    <div className="w-full aspect-video bg-gray-800 relative overflow-hidden">
                        {/* Main video area skeleton */}
                        <Skeleton className="w-full h-full animate-pulse" />
                        
                        {/* Loading text overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-white text-sm font-medium">Loading video...</p>
                            </div>
                        </div>
                        
                        {/* Timeline skeleton */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-black bg-opacity-50 px-4 flex items-center">
                            <Skeleton className="h-1 w-full rounded-full" />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Actual player - always rendered but initially hidden */}
            <div className={`w-full h-full transition-opacity duration-300 ${(!isVideoReady || isInitializing) ? 'opacity-0' : 'opacity-100'}`}>
                <MediaPlayer
                    title={episode.title}
                    src={videoSrc}
                    ref={player}
                    onTextTrackChange={handleTrackChange}
                    onCanPlay={handleCanPlay}
                    load='eager'
                    posterLoad='eager'
                    onSeeking={() => {
                        console.log('seeking ?')
                    }}
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
        </div>
    );
}