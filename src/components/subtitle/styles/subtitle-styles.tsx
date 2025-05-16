"use client"
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleStylesSkeleton from "@/components/subtitle/styles/subtitle-styles-skeleton";
import { GeneralSettings, SubtitleStyles as TSubtitleStyles } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react";
import SubtitleStylesControls from "@/components/subtitle/styles/subtitle-styles-controls";
import { settingsQueries } from "@/lib/queries/settings";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";

type SubtitleStylesProps = {
  source: 'store' | 'database',
  syncPlayerSettings?: GeneralSettings['syncPlayerSettings']
}

export default function SubtitleStyles({ syncPlayerSettings: propSyncStrategy, source }: SubtitleStylesProps) {
  const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleStyles['transcription']>('all');
  
  const { data: remoteStyles, isLoading: isRemoteStylesLoading } = useQuery({
    ...settingsQueries.subtitleStyles(selectedTranscription),
    refetchOnWindowFocus: false,
    enabled: !!selectedTranscription && source === 'database'
  });
  
  const { data: generalSettings, isLoading: isGeneralSettingsLoading } = useQuery({
    ...settingsQueries.general(),
    refetchOnWindowFocus: false,
    enabled: propSyncStrategy === undefined && source == 'store'
  });

  const storeStyles = useSubtitleStylesStore((state) =>
    source === 'store' ? state.getStyles(selectedTranscription) : null
  );
  
  const styles = useMemo(() => {
    return source === 'database' ? remoteStyles : storeStyles
  }, [source, remoteStyles, storeStyles]);
  
  const syncPlayerSettings = useMemo(() => {
    if (propSyncStrategy !== undefined) {
      return propSyncStrategy;
    }
    return generalSettings?.syncPlayerSettings ?? 'ask';
  }, [propSyncStrategy, generalSettings]);
  
  const isLoading = useMemo(() => {
    if (source === 'database') {
      return isRemoteStylesLoading;
    }
    if (propSyncStrategy === undefined) {
      return isGeneralSettingsLoading;
    }
    return false;
  }, [source, isRemoteStylesLoading, propSyncStrategy, isGeneralSettingsLoading]);

  if (!styles || isLoading) return <SubtitleStylesSkeleton />;
  
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="text-xl font-semibold">Subtitle Styles</div>
        <div className="flex flex-row gap-2">
          <SubtitleTranscriptionSelector
            selectedTranscription={selectedTranscription}
            setSelectedTranscription={setSelectedTranscription}
          />
        </div>
      </div>
      <SubtitleStylesControls
        transcription={selectedTranscription}
        styles={styles}
        source={source}
        syncPlayerSettings={syncPlayerSettings}
      />
    </div>
  );
}