import { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsQueries } from '@/lib/queries/settings';
import { NHKEntry } from '@/types/nhk';

export function usePitchAccent(query: string) {
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  const {
    data: pitch,
    isLoading,
    error,
  } = useQuery({
    ...settingsQueries.pitchAccent({ query }),
    staleTime: 1000 * 60 * 5,
    enabled: !!query,
  });

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (pitch && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, pitch, loadingDuration]);

  const pitchLookup = useMemo(() => {
    if (!pitch) return new Map<string, NHKEntry>();
    const lookup = new Map<string, NHKEntry>();
    pitch.forEach((pitchData) => lookup.set(pitchData.word, pitchData));
    return lookup;
  }, [pitch]);

  return {
    pitch,
    isLoading,
    error,
    loadingDuration,
    pitchLookup
  };
}