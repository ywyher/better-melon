"use client";

import { MediaPlayer, type MediaPlayerInstance, MediaProvider, Poster } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Track } from "@vidstack/react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useCallback, useEffect, useRef, useMemo } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import SkipButton from '@/app/watch/[id]/[ep]/components/player/skip-button';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/components/player/skeleton';
import SubtitleTranscriptions from '@/app/watch/[id]/[ep]/components/transcriptions/transcriptions';
import { env } from '@/lib/env/client';
import DefinitionCard from '@/components/definition-card/definition-card';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useStreamingStore } from '@/lib/stores/streaming-store';
import useVideoSource from '@/lib/hooks/use-video-source';
import useSkipTimes from '@/lib/hooks/use-skip-times';
import usePlaybackControls from '@/lib/hooks/use-playback-controls';

export default function Player() {
    const player = useRef<MediaPlayerInstance>(null);
    
    const setPlayer = usePlayerStore((state) => state.setPlayer);
    const isVideoReady = usePlayerStore((state) => state.isVideoReady);
    const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);
    const autoPlay = useSettingsStore((settings) => settings.player.autoPlay);

    const streamingData = useStreamingStore((state) => state.streamingData);
    const isLoading = useStreamingStore((state) => state.isLoading);

    const { videoSrc, isInitialized } = useVideoSource();
    const { skipTimes, vttUrl, canSkip, setCanSkip, checkSkipAvailability } = useSkipTimes();
    const { onTimeUpdate } = usePlaybackControls({ checkSkipAvailability });

    useEffect(() => {
        setPlayer(player);
    }, [setPlayer]);

    const handleCanPlay = useCallback(() => {
        setIsVideoReady(true);
    }, [setIsVideoReady]);
    
    const containerClassName = useMemo(() => {
        return `w-full h-fit transition-opacity duration-300 ${(!isVideoReady || !isInitialized) ? 'opacity-0' : 'opacity-100'}`;
    }, [isVideoReady, isInitialized]);

    const videoTitle = useMemo(() => {
        return streamingData?.episode.details.attributes.canonicalTitle 
            || streamingData?.anime.title.english
            || "";
    }, [streamingData?.episode.details.attributes.canonicalTitle, streamingData?.anime.title.english]);

    const posterSrc = useMemo(() => {
        return `${env.NEXT_PUBLIC_PROXY_URL}?url=${streamingData?.episode.details.attributes.thumbnail?.original}`
            || streamingData?.anime.bannerImage;
    }, [streamingData?.episode.details.attributes.thumbnail?.original, streamingData?.anime.bannerImage]);

    const thumbnailsUrl = useMemo(() => {
        const thumbnailTrack = streamingData?.episode.sources.tracks.find(t => t.label === 'thumbnails');
        return thumbnailTrack ? `${env.NEXT_PUBLIC_PROXY_URL}?url=${thumbnailTrack}` : undefined;
    }, [streamingData?.episode.sources.tracks]);

    if (isLoading || !isInitialized) return <PlayerSkeleton />;

    return (
        <div className="relative w-full aspect-video">
            <div className={containerClassName}>
                <MediaPlayer
                    title={videoTitle}
                    src={videoSrc}
                    ref={player}
                    onCanPlay={handleCanPlay}
                    onTimeUpdate={onTimeUpdate}
                    autoPlay={autoPlay}
                    muted={autoPlay} // for autoPlay to work
                    load='eager'
                    posterLoad='eager'
                    crossOrigin="anonymous"
                    className='relative w-full h-fit'
                    aspectRatio="16/9"
                >
                    <MediaProvider>
                        <Poster
                            className="vds-poster object-cover"
                            src={posterSrc}
                            alt={streamingData?.episode.details.attributes.canonicalTitle}
                        />
                        {vttUrl && (
                            <Track kind='chapters' src={vttUrl} default label='Skip Times' />
                        )}
                    </MediaProvider>
                    <DefaultAudioLayout icons={defaultLayoutIcons} />
                    <DefaultVideoLayout
                        thumbnails={thumbnailsUrl}
                        icons={defaultLayoutIcons} 
                    />
                    <SkipButton
                        canSkip={canSkip}
                        setCanSkip={setCanSkip}
                        skipTimes={skipTimes}
                    />
                    <SubtitleTranscriptions />
                    <DefinitionCard />
                </MediaPlayer>
            </div>
        </div>
    );
}