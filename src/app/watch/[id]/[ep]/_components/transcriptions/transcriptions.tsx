'use client'

import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import { usePlayerStore } from "@/lib/stores/player-store";
import type { SubtitleTranscription } from "@/types/subtitle";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/components/multiple-selector";
import { handleTranscriptionOrder } from "@/app/settings/subtitle/_transcription-order/actions";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { SyncStrategy } from "@/types";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { Button } from "@/components/ui/button";
import { useDelayStore } from "@/lib/stores/delay-store";
import { useSubtitleStore } from "@/lib/stores/subtitle-store";
import { usePlaybackSettingsStore } from "@/lib/stores/playback-settings-store";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { useMediaState } from "@vidstack/react";

export default function SubtitleTranscriptions() {
  const player = usePlayerStore((state) => state.player);
  const activeTranscriptions = useSubtitleStore((state) => state.activeTranscriptions);
  const delay = useDelayStore((state) => state.delay);;
  const pauseOnCue = usePlaybackSettingsStore((state) => state.pauseOnCue);

  const [order, setOrder] = useState<SubtitleTranscription[]>(() => [...activeTranscriptions]);
  const debouncedOrder = useDebounce<SubtitleTranscription[]>(order, 1500);
  const hasUserDragged = useRef(false);

  const [pauseAt, setPauseAt] = useState<number | null>(null)
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);
  const [currentCueText, setCurrentCueText] = useState('');
  const handleActiveCuesIdsRef = useRef('');

  const cuePauseDuration = useWatchDataStore((state) => state.settings.playerSettings.cuePauseDuration)
  const syncPlayerSettings = useWatchDataStore((state) => state.settings.generalSettings.syncPlayerSettings)
  const styles = useWatchDataStore((state) => state.styles)
  const transcriptions = useWatchDataStore((state) => state.transcriptions)
  const {
    activeSubtitles
  } = useActiveSubtitles(transcriptions || [])

  // This would stop the player from repausing it self if we are still in the small time window
  const lastPauseTime = useRef<number>(0);
    
  const isFullscreen = useMediaState('fullscreen', player);
  const controlsVisible = useMediaState('controlsVisible', player);
  const currentTime = useMediaState('currentTime', player);
  // const currentTime = 200;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useMemo(() => {
    setOrder([...activeTranscriptions]);
  }, [activeTranscriptions]);

  const { mutate } = useMutation({
    mutationFn: async () => {
      let resolvedStrategy = syncPlayerSettings as SyncStrategy;
      
      if (resolvedStrategy === 'ask') {
        const { error, strategy } = await showSyncSettingsToast();
        if (error) {
          toast.error(error);
          return;
        }
        if(!strategy) return;
        resolvedStrategy = strategy;
      }
      
      if (resolvedStrategy === 'always' || resolvedStrategy === 'once') {
        const { message, error } = await handleTranscriptionOrder({ 
          transcriptions: debouncedOrder 
        });
  
        if (error) {
          toast.error(error);
          return;
        }
  
        toast.success(message || `Transcription order updated successfully`);
      }
    }
  })
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
      const {active, over} = event;
      
      if(!active || !over || active.id === over.id) return;
      
      hasUserDragged.current = true;
              
      setOrder(currentOrder => {
        const oldIndex = currentOrder.indexOf(active.id.toString() as SubtitleTranscription);
        const newIndex = currentOrder.indexOf(over.id.toString() as SubtitleTranscription);
        
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
  }, []);

  useEffect(() => {
    const shouldTriggerUpdate = 
      debouncedOrder.length > 0 && 
      hasUserDragged.current
    
    if (shouldTriggerUpdate) {
      mutate();
    }
  }, [debouncedOrder, mutate, hasUserDragged]);

  useEffect(() => {
    const handleCueFeatures = () => {
      if (!player.current || !activeSubtitles) return;

      const allActiveCues = Object.entries(activeSubtitles)
        .filter(([transcription]) => transcription !== 'english')
        .flatMap(([_, cues]) => cues);
      
      const currentAllCueIds = allActiveCues.map(cue => cue.id).sort().join(',');

      if (allActiveCues.length > 0 && currentAllCueIds !== handleActiveCuesIdsRef.current) {
        const cue = allActiveCues.filter(c => c.transcription == 'japanese')[0];
        setCurrentCueText(cue.content);

        if(pauseOnCue) {
          const pauseAt = cue.to + delay.japanese

          setPauseAt(pauseAt - 0.3)
        }
        
        handleActiveCuesIdsRef.current = currentAllCueIds;
      }
    };
    
    handleCueFeatures();
  }, [activeSubtitles, player, delay.japanese]);

  // Replace the existing useEffect for pausing/unpausing with this one
  useEffect(() => {
    let unPauseTimeout: NodeJS.Timeout | null = null;
    
    if(player.current && pauseOnCue && pauseAt) {
      const adjustedCurrentTime = currentTime + delay.japanese;
      const currentTimeMs = Date.now();
      
      // Check if we're in the pause window and haven't paused recently
      if(adjustedCurrentTime >= pauseAt && 
        adjustedCurrentTime < pauseAt + 0.1 && 
        currentTimeMs - lastPauseTime.current > 1000) {
        
        player.current.pause();
        lastPauseTime.current = currentTimeMs;
        
        // Store the current pauseAt value we're handling
        const currentPausePoint = pauseAt;
        
        if (cuePauseDuration !== null && cuePauseDuration > 0) {
          unPauseTimeout = setTimeout(() => {
            if (player.current && player.current.paused) {
              player.current.play();
              // Only clear pauseAt after auto-unpausing and if it hasn't changed
              if (pauseAt === currentPausePoint) {
                setPauseAt(null);
              }
            }
          }, cuePauseDuration * 1000);
        } else {
          // If there's no auto-unpause, clear pauseAt immediately
          setPauseAt(null);
        }
      }
    }
    
    return () => {
      if (unPauseTimeout) {
        clearTimeout(unPauseTimeout);
      }
    };
  }, [pauseAt, currentTime, delay.japanese, pauseOnCue, player, cuePauseDuration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (currentCueText && copyButtonRef.current) {
          copyButtonRef.current.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentCueText]);

  const getBottomPosition = useCallback(() => {
    if (isFullscreen) {
        return controlsVisible ? '5' : '2';
    }
    return controlsVisible ? '4' : '1';
  }, [isFullscreen, controlsVisible]);

  const wrapperStyles = useMemo(() => ({
    transition: 'bottom 0.3s ease',
    height: 'fit-content',
    bottom: `${getBottomPosition()}rem`
  }), [getBottomPosition]);

  return (
    <div
      className="absolute left-1/2 transform -translate-x-1/2 flex items-center flex-col w-[100%]"
      style={wrapperStyles}
    >
      <Button
        ref={copyButtonRef}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(currentCueText);
            toast.success("Subtitle copied to clipboard");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to copy text`);
          }
        }}
        className="hidden"
      >
      </Button>
      <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
      >
          <SortableContext 
              items={order}
              strategy={verticalListSortingStrategy}
          >
              {order.map(transcription => {
                  if (!activeSubtitles?.[transcription]?.length) return null;

                  const tokenStyles =
                    styles[transcription]?.tokenStyles
                    || styles['all'].tokenStyles

                  const containerStyle = 
                    styles[transcription]?.containerStyle
                    || styles["all"].containerStyle

                  // Get furigana styles for ruby text
                  const furiganaStyles = {
                    tokenStyles: styles['furigana']?.tokenStyles || styles['all'].tokenStyles,
                    containerStyle: styles['furigana']?.containerStyle || styles['all'].containerStyle
                  }

                  return (
                    <TranscriptionItem
                      key={transcription}
                      transcription={transcription}
                      furiganaStyles={furiganaStyles}
                      activeSubtitles={activeSubtitles}
                      styles={{
                        tokenStyles,
                        containerStyle: containerStyle
                      }}
                    />
                  );
              })}
          </SortableContext>
      </DndContext>
    </div>
  );
}