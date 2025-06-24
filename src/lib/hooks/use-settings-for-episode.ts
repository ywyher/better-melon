import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsQueries } from '@/lib/queries/settings';
import { SettingsForEpisode } from '@/types/settings';
import { usePathname } from 'next/navigation';

export function useSettingsForEpisode() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const loadingStartTime = useRef<number>(0);
  const [loadingDuration, setLoadingDuration] = useState<number>(0);
  
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    ...settingsQueries.forEpisode(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: settingsQueries.forEpisode().queryKey });
  }, [pathname, queryClient]);

  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = Date.now();
    } else if (settings && loadingStartTime.current > 0 && loadingDuration === 0) {
      const duration = Date.now() - loadingStartTime.current;
      setLoadingDuration(duration);
    }
  }, [isLoading, settings, loadingDuration]);

  return {
    settings,
    isLoading,
    error,
    loadingDuration,
  };
}