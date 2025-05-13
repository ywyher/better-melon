"use client";

import { MediaPlayer, type MediaPlayerInstance, MediaProvider } from '@vidstack/react';
import { DefaultAudioLayout, defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Track } from "@vidstack/react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useCallback, useEffect, useRef, useState, useMemo, memo, Dispatch, SetStateAction } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import type { AnimeEpisodeMetadata, AnimeStreamingLinks, SkipTime } from '@/types/anime';
import SkipButton from '@/app/watch/[id]/[ep]/_components/player/skip-button';
import PlayerSkeleton from '@/app/watch/[id]/[ep]/_components/player/player-skeleton';
import { useThrottledCallback } from 'use-debounce';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DefinitionCard from '@/components/definition-card';
import { generateWebVTTFromSkipTimes } from '@/lib/subtitle/utils';
import SubtitleTranscriptionsContainer from '@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions-container';
import { env } from '@/lib/env/client';
import { TranscriptionQuery, TranscriptionStyles } from '@/app/watch/[id]/[ep]/types';

type PlayerProps = {
  animeId: string;
  episodeNumber: number;
  metadata: AnimeEpisodeMetadata;
  streamingLinks: AnimeStreamingLinks;
  episodesLength: number;
  transcriptions: TranscriptionQuery[]
  transcriptionsStyles: TranscriptionStyles
}

const MemoizedPlayerSkeleton = memo(PlayerSkeleton);
const MemoizedSkipButton = memo(SkipButton);
const MemoizedDefinitionCard = memo(DefinitionCard);

export default function Player({ 
  animeId,
  episodeNumber,
  streamingLinks,
  metadata,
  episodesLength,
  transcriptions,
  transcriptionsStyles
}: PlayerProps) {
    const router = useRouter()
    
    const player = useRef<MediaPlayerInstance>(null);
    const [videoSrc, setVideoSrc] = useState("");
    const [vttUrl, setVttUrl] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [skipTimes, setSkipTimes] = useState<SkipTime[]>([])
    const [canSkip, setCanSkip] = useState(false)
    const isTransitioning = useRef(false);

    const setPlayer = usePlayerStore((state) => state.setPlayer);
    const isVideoReady = usePlayerStore((state) => state.isVideoReady);
    const setIsVideoReady = usePlayerStore((state) => state.setIsVideoReady);
    const autoSkip = usePlayerStore((state) => state.autoSkip);
    const autoNext = usePlayerStore((state) => state.autoNext);
    const autoPlay = usePlayerStore((state) => state.autoPlay);

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
      if(!streamingLinks) return;

      const url = `${env.NEXT_PUBLIC_PROXY_URL}?url=${streamingLinks.sources[0].url}`
      // const url = '/video.mp4'
      // console.debug(`url ${url}`)
      setVideoSrc(url)
      setIsInitialized(true);
      setLoadingDuration({ start: new Date(), end: undefined })
    }, [streamingLinks, isInitialized]);

    useEffect(() => {
        if (!streamingLinks || !player.current) return;

        const skipTimesData = [
            {
                interval: {
                    startTime: streamingLinks.intro.start,
                    endTime: streamingLinks.intro.end,
                },
                skipType: 'OP' as SkipTime['skipType']
            },
            {
                interval: {
                    startTime: streamingLinks.outro.start,
                    endTime: streamingLinks.outro.end,
                },
                skipType: 'OT' as SkipTime['skipType']
            }
        ];

        setSkipTimes(skipTimesData);
        
        const vttContent = generateWebVTTFromSkipTimes({
            skipTimes: skipTimesData,
            totalDuration: player.current?.duration || 0,
            episode: {
                title: metadata.title || "",
                number: metadata.number || episodeNumber
            }
        });
        
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const blobUrl = URL.createObjectURL(blob);
        setVttUrl(blobUrl);
        
        // Clean up function to revoke blob URL when component unmounts
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [metadata, streamingLinks, player.current?.duration, episodeNumber]);

    const handleCanPlay = useCallback(() => {
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
                console.log('No more episodes');
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
            {(!isVideoReady || !isInitialized) && (
              <>
                <MemoizedPlayerSkeleton isLoading={!isVideoReady || !isInitialized} />
              </>
            )}
            <div className={containerClassName}>
                {loadingDuration.start && loadingDuration.end && (
                  <p>Loaded in: {
                    ((loadingDuration.end.getTime() - loadingDuration.start.getTime()) / 1000).toFixed(2)
                  }s</p>
                )}
                <MediaPlayer
                    title={metadata.title || ""}
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
                    <SubtitleTranscriptionsContainer
                      transcriptions={transcriptions}
                      styles={transcriptionsStyles}
                    />
                    <MemoizedDefinitionCard />
                </MediaPlayer>
            </div>
        </div>
    );
}