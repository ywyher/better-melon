"use client";

import { MediaPlayer, type MediaPlayerInstance, MediaProvider, Poster } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Track } from "@vidstack/react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import SkipButton from '@/app/watch/[id]/[ep]/components/player/skip-button';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/components/player/player-skeleton';
import { useThrottledCallback } from 'use-debounce';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generateWebVTTFromSkipTimes } from '@/lib/utils/subtitle';
import SubtitleTranscriptions from '@/app/watch/[id]/[ep]/components/transcriptions/transcriptions';
import { env } from '@/lib/env/client';
import DefinitionCard from '@/components/definition-card/definition-card';
import { AnimeSkipTime } from '@/types/anime';
import { useEpisodeStore } from '@/lib/stores/episode-store';
import { useSettingsStore } from '@/lib/stores/settings-store';

const MemoizedPlayerSkeleton = memo(PlayerSkeleton);
const MemoizedSkipButton = memo(SkipButton);
const MemoizedDefinitionCard = memo(DefinitionCard);

export default function Player() {
    const router = useRouter()
    
    const player = useRef<MediaPlayerInstance>(null);
    const [videoSrc, setVideoSrc] = useState("");
    const [vttUrl, setVttUrl] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [skipTimes, setSkipTimes] = useState<AnimeSkipTime[]>([])
    const [canSkip, setCanSkip] = useState(false)
    const isTransitioning = useRef(false);

    const setPlayer = usePlayerStore((state) => state.setPlayer);
    const isVideoReady = usePlayerStore((state) => state.isVideoReady);
    const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);
    const autoSkip = useSettingsStore((settings) => settings.player.autoSkip);
    const autoNext = useSettingsStore((settings) => settings.player.autoNext);
    const autoPlay = useSettingsStore((settings) => settings.player.autoPlay);

    const sources = useEpisodeStore((state) => state.episodeData?.sources)
    const metadata = useEpisodeStore((state) => state.episodeData?.metadata)
    const episodeNumber = useEpisodeStore((state) => state.episodeNumber)
    const episodesLength = useEpisodeStore((state) => state.episodesLength)
    const animeId = useEpisodeStore((state) => state.animeId)

    const [loadingDuration, setLoadingDuration] = useState<{
      start: Date | undefined,
      end: Date | undefined
    }>({
      start: undefined,
      end: undefined
    });

    useEffect(() => {
      setPlayer(player)
    }, [setPlayer]);

    useEffect(() => {
      if(!sources || !sources.sources.file) return;

      const url = `${env.NEXT_PUBLIC_PROXY_URL}?url=${sources.sources.file}`
      setVideoSrc(url)
      setIsInitialized(true);
      setLoadingDuration({ start: new Date(), end: undefined })
    }, [sources]);

    useEffect(() => {
        if (!sources || !player.current) return;

        const skipTimesData = [
            {
                interval: {
                    startTime: sources.intro.start,
                    endTime: sources.intro.end,
                },
                skipType: 'OP' as AnimeSkipTime['skipType']
            },
            {
                interval: {
                    startTime: sources.outro.start,
                    endTime: sources.outro.end,
                },
                skipType: 'OT' as AnimeSkipTime['skipType']
            }
        ];

        setSkipTimes(skipTimesData);
        
        const vttContent = generateWebVTTFromSkipTimes({
            skipTimes: skipTimesData,
            totalDuration: player.current?.duration || 0,
            episode: {
                title: metadata?.title || "",
                number: metadata?.number || episodeNumber
            }
        });
        
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const blobUrl = URL.createObjectURL(blob);
        setVttUrl(blobUrl);
        
        // Clean up function to revoke blob URL when component unmounts
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [metadata, sources, player.current?.duration, episodeNumber]);

    const handleCanPlay = useCallback(() => {
        console.log('can play from player')
        setIsVideoReady(true);
        setLoadingDuration(prev => ({
          ...prev,
          end: new Date()
        }));
    }, [setIsVideoReady, setLoadingDuration]);

    const handlePlaybackEnded = useCallback(() => {
        if (!autoNext) {
            isTransitioning.current = false;
            return;
        }
    
        try {
            player.current?.pause();
            
            if (episodeNumber < episodesLength) {
                router.push(`/watch/${animeId}/${episodeNumber + 1}`);
            } else {
                toast.message("No more episodes to watch :(");
                isTransitioning.current = false;
            }
        } catch (error) {
            console.error('Error moving to the next episode:', error);
            isTransitioning.current = false;
        }
    }, [autoNext, episodeNumber, episodesLength, animeId, router]);

    const onTimeUpdate = useThrottledCallback(() => {
        if (!player.current) return;
        
        const currentTime = player.current.currentTime;
        const duration = player.current.duration;
        
        if (skipTimes.length) {
            const skipInterval = skipTimes.find(
                ({ interval }) => currentTime >= interval.startTime && currentTime < interval.endTime
            );
            if (skipInterval) {
                if (autoSkip) {
                    player.current.currentTime = skipInterval.interval.endTime;
                }else {
                    setCanSkip(true);
                }
            } else {
                setCanSkip(false);
            }
        }
        
        if ((duration - currentTime) < 3 && duration > 0 && !isTransitioning.current) {
            isTransitioning.current = true
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
            {(!isInitialized) && (
              <>
                <MemoizedPlayerSkeleton isLoading={!isInitialized} />
              </>
            )}
            <div className={containerClassName}>
                {loadingDuration.start && loadingDuration.end && (
                  <p>Loaded in: {
                    ((loadingDuration.end.getTime() - loadingDuration.start.getTime()) / 1000).toFixed(2)
                  }s</p>
                )}
                <MediaPlayer
                    title={metadata?.title || ""}
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
                            className="vds-poster"
                            src={metadata?.image}
                            alt={metadata?.title}
                        />
                        {vttUrl && (
                            <Track kind='chapters' src={vttUrl} default label='Skip Times' />
                        )}
                    </MediaProvider>
                    <DefaultAudioLayout icons={defaultLayoutIcons} />
                    <DefaultVideoLayout
                        thumbnails={`${env.NEXT_PUBLIC_PROXY_URL}?url=${metadata?.thumbnails?.file}`}
                        icons={defaultLayoutIcons} 
                    />
                    <MemoizedSkipButton
                        canSkip={canSkip}
                        setCanSkip={setCanSkip}
                        currentTime={player.current?.currentTime || 0}
                        skipTimes={skipTimes}
                    />
                    <SubtitleTranscriptions />
                    <MemoizedDefinitionCard />
                </MediaPlayer>
            </div>
        </div>
    );
}