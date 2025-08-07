import { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsQueries } from '@/lib/queries/settings';
import { Word } from '@/lib/db/schema';
import { WordsLookup } from '@/app/watch/[id]/[ep]/types';

type UseWordsProps = {
  status?: Word['status']
  shouldFetch: boolean
}

export function useWords({
  status,
  shouldFetch
}: UseWordsProps) {
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  const {
    data: words,
    isLoading,
    error,
  } = useQuery({
    ...settingsQueries.words({ status }),
    staleTime: 1000 * 60 * 5,
    enabled: !!shouldFetch,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (words && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, words, loadingDuration]);


  const wordsLookup = useMemo(() => {
    if (!words) return new Map() as WordsLookup;
    const lookup = new Map() as WordsLookup;
    console.log(`words`, words)
    words.forEach((wordsData) => lookup.set(wordsData.word, {
      word: wordsData.word,
      status: wordsData.status
    }));
    return lookup;
  }, [words]);

  return {
    words,
    isLoading,
    error,
    loadingDuration,
    wordsLookup
  };
}