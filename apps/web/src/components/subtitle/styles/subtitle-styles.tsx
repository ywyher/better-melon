"use client"

import SubtitleTranscriptionSelector from "@/components/subtitle/subtitle-transcription-selector";
import { GeneralSettings, SubtitleStyles as TSubtitleStyles } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react";
import SubtitleStylesControls from "@/components/subtitle/styles/subtitle-styles-controls";
import { settingsQueries } from "@/lib/queries/settings";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import DeleteSubtitleStyles from "@/components/subtitle/styles/delete-subtitle-styles";
import SegmentedToggle from "@/components/segmented-toggle";
import { subitlteStylesState } from "@/lib/constants/subtitle";
import { defaultSubtitleStyles } from "@/components/subtitle/styles/constants";
import { LoadingOverlay } from "@/components/loading-overlay";
import SubtitleStylesSkeleton from "@/components/subtitle/styles/subtitle-styles-skeleton";

type SubtitleStylesProps = {
  source: 'store' | 'database',
  syncSettings?: GeneralSettings['syncSettings']
}

export default function SubtitleStyles({ syncSettings: propSyncStrategy, source }: SubtitleStylesProps) {
  const [selectedTranscription, setSelectedTranscription] = useState<TSubtitleStyles['transcription']>('all');
  const [selectedState, setSelectedState] = useState<TSubtitleStyles['state']>('default');
  
  const { data: remoteStyles, isLoading: isRemoteStylesLoading, isRefetching } = useQuery({
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
    source === 'store' ? state.getRawStyles(selectedTranscription, selectedState) : (selectedState == 'default' ? defaultSubtitleStyles[selectedTranscription].default : defaultSubtitleStyles[selectedTranscription].active)
  );

  const styles = useMemo(() => {
    return source === 'database' ? remoteStyles : storeStyles
  }, [source, remoteStyles, storeStyles]);
  
  const syncSettings = useMemo(() => {
    if (propSyncStrategy !== undefined) {
      return propSyncStrategy;
    }
    return generalSettings?.syncSettings ?? 'ask';
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

  const shouldShowDeleteButton = useMemo(() => {
    const currentStyles = source === 'database' ? remoteStyles : storeStyles;
    const defaultStyles = selectedState === 'active' ? defaultSubtitleStyles[selectedTranscription].active : defaultSubtitleStyles[selectedTranscription].default;
    
    return currentStyles && JSON.stringify(currentStyles) !== JSON.stringify(defaultStyles);
  }, [source, remoteStyles, storeStyles, selectedState, selectedTranscription]);

  if (!styles || isLoading) return <SubtitleStylesSkeleton />;
  
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 pb-6 pt-3 border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
            <h3 className="text-lg font-medium">Subtitle Styles</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Customize subtitle appearance and behavior
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex flex-row gap-2 sm:w-full lg:w-fit">
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
            
            {shouldShowDeleteButton && (
              <DeleteSubtitleStyles
                syncSettings={syncSettings}
                transcription={selectedTranscription}
                source={source}
                state={selectedState}
                subtitleStylesId={
                  source === 'database' 
                    ? remoteStyles?.id || ""
                    : styles['id']
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 min-h-0 relative">
        <div className="h-full overflow-y-auto">
          <SubtitleStylesControls
            transcription={selectedTranscription}
            styles={styles}
            source={source}
            syncSettings={syncSettings}
            state={selectedState}
          />
        </div>
        
        {isRefetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <LoadingOverlay />
          </div>
        )}
      </div>
    </div>
  );
}