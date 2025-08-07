import { useState, useEffect } from 'react';
import { env } from '@/lib/env/client';
import { useStreamingStore } from '@/lib/stores/streaming-store';

export default function useVideoSource() {
  const streamingData = useStreamingStore((state) => state.streamingData)
  const [videoSrc, setVideoSrc] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!streamingData?.episode.sources) return;

    const url = `${env.NEXT_PUBLIC_PROXY_URL}?url=${streamingData.episode.sources.sources.file}`;
    setVideoSrc(url);
    setIsInitialized(true);
  }, [streamingData?.episode.sources]);

  return {
    videoSrc,
    isInitialized
  };
};