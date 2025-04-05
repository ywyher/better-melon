"use client";

import { MediaPlayer, MediaPlayerInstance, MediaProvider, TextTrack } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Track } from "@vidstack/react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { SubtitleFile } from '@/types/subtitle';
import { AnimeEpisodeData, AnimeStreamingData, SkipTime } from '@/types/anime';
import { generateWebVTTFromSkipTimes } from '@/app/watch/[id]/[ep]/funcs';
import Subtitle from '@/app/watch/[id]/[ep]/_components/subtitle';
import SkipButton from '@/app/watch/[id]/[ep]/_components/player/skip-button';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/_components/player/player-skeleton';
import { useThrottledCallback } from 'use-debounce';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

type PlayerProps = { 
    streamingData: AnimeStreamingData;
    episode: AnimeEpisodeData;
    subtitleFiles: SubtitleFile[];
    episodesLength: number
}

const MemoizedSubtitle = memo(Subtitle);
const MemoizedPlayerSkeleton = memo(PlayerSkeleton);
const MemoizedSkipButton = memo(SkipButton);

export default function Player({ 
    streamingData,
    episode, subtitleFiles,
    episodesLength
}: PlayerProps) {
    const { id, ep } = useParams<{ id: string, ep: string }>()
    const router = useRouter()
    
    const player = useRef<MediaPlayerInstance>(null);
    const [videoSrc, setVideoSrc] = useState("");
    const [vttUrl, setVttUrl] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [skipTimes, setSkipTimes] = useState<SkipTime[]>([])
    const [canSkip, setCanSkip] = useState(false)

    const isTransitioning = useRef(false);

    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const setActiveSubtitleFile = useWatchStore((state) => state.setActiveSubtitleFile);
    const setPlayer = useWatchStore((state) => state.setPlayer);
    
    const autoSkip = useWatchStore((state) => state.autoSkip);
    const autoNext = useWatchStore((state) => state.autoNext);
    const autoPlay = useWatchStore((state) => state.autoPlay);

    useEffect(() => {
        setPlayer(player)
    }, [setPlayer]);

    useEffect(() => {
        if(!streamingData) return;
        
        const url = encodeURIComponent(streamingData.sources[0].url);
        setVideoSrc(`${process.env.NEXT_PUBLIC_PROXY_URL}?url=${url}`);

        setIsInitialized(true);
    }, [streamingData, isInitialized]);

    useEffect(() => {
        if (!streamingData || !player.current) return;

        const skipTimesData = [
            {
                interval: {
                    startTime: streamingData.intro.start,
                    endTime: streamingData.intro.end,
                },
                skipType: 'OP' as SkipTime['skipType']
            },
            {
                interval: {
                    startTime: streamingData.outro.start,
                    endTime: streamingData.outro.end,
                },
                skipType: 'OT' as SkipTime['skipType']
            }
        ];

        setSkipTimes(skipTimesData);
        
        const vttContent = generateWebVTTFromSkipTimes({
            skipTimes: skipTimesData,
            totalDuration: player.current?.duration || 0,
            episode: {
                title: episode.title,
                number: episode.number
            }
        });
        
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const blobUrl = URL.createObjectURL(blob);
        setVttUrl(blobUrl);
        
        // Clean up function to revoke blob URL when component unmounts
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [episode, streamingData, player.current?.duration]);

    const handleTrackChange = useCallback((track: TextTrack | null) => {
        if (!track || !subtitleFiles.length || activeSubtitleFile?.file.name === track.label) return;
    
        const matchedSub = subtitleFiles.find(s => s.name === track.label);
        if (matchedSub) {
            setActiveSubtitleFile({
                source: "remote",
                file: {
                    name: matchedSub.name,
                    url: matchedSub.url,
                    last_modified: matchedSub.last_modified,
                    size: matchedSub.size
                }
            });
        }
    }, [subtitleFiles, activeSubtitleFile?.file.name, setActiveSubtitleFile]);
    
    const handleCanPlay = useCallback(() => {
        setIsVideoReady(true);
    }, []);

    const handlePlaybackEnded = useCallback(() => {
        if (!autoNext) {
            isTransitioning.current = false; // Reset if not auto-next
            return;
        }
    
        try {
            const epNumber = parseInt(ep);
            player.current?.pause();
            
            if (epNumber < episodesLength) {
                router.push(`/watch/${id}/${epNumber + 1}`);
            } else {
                console.log('No more episodes');
                toast.message("No more episodes to watch :(");
                isTransitioning.current = false; // Reset since we're not navigating
            }
        } catch (error) {
            console.error('Error moving to the next episode:', error);
            isTransitioning.current = false; // Reset on error
        }
    }, [autoNext, ep, episodesLength, id, router]);

    const onTimeUpdate = useThrottledCallback(() => {
        if (!player.current) return;
        
        const currentTime = player.current.currentTime;
        const duration = player.current.duration;
        
        // Handle skip times
        if (skipTimes.length) {
            const skipInterval = skipTimes.find(
                ({ interval }) => currentTime >= interval.startTime && currentTime < interval.endTime
            );
            if (skipInterval) {
                setCanSkip(true);
                if (autoSkip) {
                    player.current.currentTime = skipInterval.interval.endTime;
                }
            } else {
                setCanSkip(false);
            }
        }
        
        // "Almost ended" logic - add a flag to prevent multiple triggers
        if ((duration - currentTime) < 3 && duration > 0 && !isTransitioning.current) {
            isTransitioning.current = true; // Prevent multiple triggers
            handlePlaybackEnded();
        }
    }, 500, { trailing: true, leading: true });

    
    const containerClassName = useMemo(() => {
        return `w-full h-fit transition-opacity duration-300 ${(!isVideoReady || !isInitialized) ? 'opacity-0' : 'opacity-100'}`;
    }, [isVideoReady, isInitialized]);

    useEffect(() => {
        return () => {
            if (vttUrl) URL.revokeObjectURL(vttUrl);
        };
    }, [vttUrl]);

    return (
        <div className="relative w-full aspect-video">
            {(!isVideoReady || !isInitialized) && (
                <MemoizedPlayerSkeleton isLoading={!isVideoReady || !isInitialized} />
            )}
            <div className={containerClassName}>
                <MediaPlayer
                    title={episode.title}
                    src={videoSrc}
                    ref={player}
                    onTextTrackChange={handleTrackChange}
                    onCanPlay={handleCanPlay}
                    onTimeUpdate={onTimeUpdate}
                    autoPlay={autoPlay}
                    muted={autoPlay} // for autoPlay to work
                    load='eager'
                    posterLoad='eager'
                    crossOrigin="anonymous"
                    className='relative w-full h-fit'
                >
                    <MediaProvider>
                        {/* <Poster
                            className="vds-poster"
                            src={episode.image}
                            alt={episode.title}
                        /> */}
                        {vttUrl && (
                            <Track kind='chapters' src={vttUrl} default label='Skip Times' />
                        )}
                    </MediaProvider>
                    <DefaultAudioLayout icons={defaultLayoutIcons} />
                    <DefaultVideoLayout
                        // thumbnails={`https://files.vidstack.io/sprite-fight/thumbnails.vtt`}
                        icons={defaultLayoutIcons} 
                    />
                    <MemoizedSkipButton
                        canSkip={canSkip}
                        setCanSkip={setCanSkip}
                        currentTime={player.current?.currentTime || 0}
                        skipTimes={skipTimes}
                    />
                    <MemoizedSubtitle />
                </MediaPlayer>
            </div>
        </div>
    );
}