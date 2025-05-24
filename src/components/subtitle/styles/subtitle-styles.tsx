"use client"
import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import SubtitleStylesSkeleton from "@/components/subtitle/styles/subtitle-styles-skeleton";
import { GeneralSettings, SubtitleStyles as TSubtitleStyles } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react";
import SubtitleStylesControls from "@/components/subtitle/styles/subtitle-styles-controls";
import { settingsQueries } from "@/lib/queries/settings";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import DeleteSubtitleStyles from "@/components/subtitle/styles/delete-subtitle-styles";
import SegmentedToggle from "@/components/segmented-toggle";
import { subitlteStylesState } from "@/lib/constants/subtitle";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";

type SubtitleStylesProps = {
  source: 'store' | 'database',
  syncPlayerSettings?: GeneralSettings['syncPlayerSettings']
}

export default function SubtitleStyles({ syncPlayerSettings: propSyncStrategy, source }: SubtitleStylesProps) {
  const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleStyles['transcription']>('all');
  const [selectedState, setSelectedState] = useState<TSubtitleStyles['state']>('default');
  
  const { data: remoteStyles, isLoading: isRemoteStylesLoading } = useQuery({
    ...settingsQueries.subtitleStyles(selectedTranscription, selectedState),
    refetchOnWindowFocus: false,
    enabled: !!selectedTranscription && !!selectedState && source === 'database'
  });

  const { data: generalSettings, isLoading: isGeneralSettingsLoading } = useQuery({
    ...settingsQueries.general(),
    refetchOnWindowFocus: false,
    enabled: propSyncStrategy === undefined && source == 'store'
  });

  const storeStyles = useSubtitleStylesStore((state) =>
    source === 'store' ? state.getStyles(selectedTranscription) : (selectedState == 'default' ? defaultSubtitleStyles.default : defaultSubtitleStyles.active)
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

  useEffect(() => {
    console.log({
      state: selectedState,
      test: JSON.stringify(remoteStyles) != JSON.stringify(defaultSubtitleStyles.default)
    })
  }, [remoteStyles, selectedState])

  if (!styles || isLoading) return <SubtitleStylesSkeleton />;
  
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="text-xl font-semibold">Subtitle Styles</div>
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2">
            <SegmentedToggle 
              options={subitlteStylesState}
              onValueChange={(v) => setSelectedState(v)}
              value={selectedState}
            />
            <SubtitleTranscriptionSelector
              selectedTranscription={selectedTranscription}
              setSelectedTranscription={setSelectedTranscription}
              setSelectedState={setSelectedState}
            />
          </div>
          {(
            (selectedState == 'active' && JSON.stringify(remoteStyles) != JSON.stringify(defaultSubtitleStyles.active)) ||
            (selectedState == 'default' && JSON.stringify(remoteStyles) != JSON.stringify(defaultSubtitleStyles.default))
          ) && (
            <DeleteSubtitleStyles
              syncPlayerSettings={syncPlayerSettings}
              transcription={selectedTranscription}
              source={source}
              subtitleStylesId={
                source === 'database' 
                  ? remoteStyles?.id || ""
                  : styles['id']
              }
            />
          )}
        </div>
      </div>
      <SubtitleStylesControls
        transcription={selectedTranscription}
        styles={styles}
        source={source}
        syncPlayerSettings={syncPlayerSettings}
        state={selectedState}
      />
    </div>
  );
}