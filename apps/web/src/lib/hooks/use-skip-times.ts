import { useState, useEffect, useMemo } from 'react';
import { generateWebVTTFromSkipTimes } from '@/lib/utils/subtitle';
import { AnimeSkipTime } from '@/types/anime';
import { useStreamingStore } from '@/lib/stores/streaming-store';
import { usePlayerStore } from '@/lib/stores/player-store';
import { useSettingsStore } from '@/lib/stores/settings-store';

export default function useSkipTimes() {
  const player = usePlayerStore((state) => state.player)
  const streamingData = useStreamingStore((state) => state.streamingData)
  const episodeNumber = useStreamingStore((state) => state.episodeNumber)
  const [skipTimes, setSkipTimes] = useState<AnimeSkipTime[]>([]);
  const [vttUrl, setVttUrl] = useState<string>('');
  const [canSkip, setCanSkip] = useState(false);

  // Generate skip times data from streaming data
  const skipTimesData = useMemo(() => {
    if (!streamingData?.episode.sources) return [];

    return [
      {
        interval: {
          startTime: streamingData.episode.sources.intro.start,
          endTime: streamingData.episode.sources.intro.end,
        },
        skipType: 'OP' as AnimeSkipTime['skipType']
      },
      {
        interval: {
          startTime: streamingData.episode.sources.outro.start,
          endTime: streamingData.episode.sources.outro.end,
        },
        skipType: 'OT' as AnimeSkipTime['skipType']
      }
    ];
  }, [streamingData?.episode.sources]);

  // Set skip times and generate VTT
  useEffect(() => {
    if (!streamingData?.episode.sources || !player.current) return;

    setSkipTimes(skipTimesData);
    
    const vttContent = generateWebVTTFromSkipTimes({
      skipTimes: skipTimesData,
      totalDuration: player.current?.duration || 0,
      episode: {
        title: streamingData.anime?.title.english,
        number: episodeNumber
      }
    });
    
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const blobUrl = URL.createObjectURL(blob);
    setVttUrl(blobUrl);
    
    // Clean up function to revoke blob URL when component unmounts
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [streamingData, player.current?.duration, episodeNumber, skipTimesData]);

  // Clean up VTT URL on unmount
  useEffect(() => {
    return () => {
      if (vttUrl) URL.revokeObjectURL(vttUrl);
    };
  }, [vttUrl]);

  const checkSkipAvailability = ({ currentTime, autoSkip }: { currentTime: number, autoSkip: boolean }) => {
    if (!skipTimes.length) {
      setCanSkip(false);
      return null;
    }

    const skipInterval = skipTimes.find(
      ({ interval }) => currentTime >= interval.startTime && currentTime < interval.endTime
    );

    if (skipInterval) {
      if (autoSkip) {
        return skipInterval; // Return interval to skip to
      } else {
        setCanSkip(true);
      }
    } else {
      setCanSkip(false);
    }

    return null;
  };

  return {
    skipTimes,
    vttUrl,
    canSkip,
    setCanSkip,
    checkSkipAvailability
  };
};