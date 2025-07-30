import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsQueries } from '@/lib/queries/settings';
import { usePathname } from 'next/navigation';
import { defaultSubtitleSettings } from '@/app/settings/subtitle/_subtitle-settings/constants';
import { defaultGeneralSettings } from '@/lib/constants/settings';
import { defaultPlayerSettings } from '@/app/settings/player/constants';
import { defaultWordSettings } from '@/app/settings/word/constants';
import { SettingsForEpisode } from '@/types/settings';

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
    placeholderData: {
      subtitleSettings: defaultSubtitleSettings,
      generalSettings: defaultGeneralSettings,
      playerSettings: defaultPlayerSettings,
      wordSettings: defaultWordSettings,
    },
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
    settings: settings as SettingsForEpisode,
    isLoading,
    error,
    loadingDuration,
  };
}