import { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pitchQueries } from '@/lib/queries/pitch';
import { getPitchAccent } from '@/lib/utils/pitch';
import { PitchAccents } from '@/types/pitch';

export function usePitchAccent(query: string) {
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  const {
    data: pitch,
    isLoading,
    error,
  } = useQuery({
    ...pitchQueries.accent({ query }),
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

  const accent: PitchAccents | undefined = useMemo(() => {
    if(!pitch || pitch?.length == 0) return;
    
    return getPitchAccent({ 
      position: pitch[0].pitches[0].position,
      reading: query
    }) 
  }, [pitch])

  return {
    pitch,
    accent,
    isLoading,
    error,
    loadingDuration,
  };
}