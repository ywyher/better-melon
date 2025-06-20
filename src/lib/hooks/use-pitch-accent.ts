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

  const pitchLookupRef = useRef(new Map<string, NHKEntry>());
  const pitchLookup = useMemo(() => {
    if (!pitch) return pitchLookupRef.current;
    pitch.forEach((pitchData) => pitchLookupRef.current.set(pitchData.word, pitchData));
    return pitchLookupRef.current;
  }, [pitch]);

  return {
    pitch,
    isLoading,
    error,
    loadingDuration,
    pitchLookup
  };
}