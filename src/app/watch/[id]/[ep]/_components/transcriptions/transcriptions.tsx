'use client'

import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import { usePlayerStore } from "@/lib/stores/player-store";
import type { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TranscriptionQuery, TranscriptionsLookup, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";
import { useDebounce } from "@/components/multiple-selector";
import { handleTranscriptionOrder } from "@/app/settings/subtitle/_transcription-order/actions";
import { toast } from "sonner";
import { GeneralSettings, PlayerSettings, SubtitleSettings } from "@/lib/db/schema";
import { useMutation } from "@tanstack/react-query";
import { SyncStrategy } from "@/types";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { Button } from "@/components/ui/button";
import { useMediaState } from "@vidstack/react";

type SubtitleTranscriptionsProps = {
  transcriptions: TranscriptionQuery[];
  styles: TranscriptionStyles;
  syncPlayerSettings: GeneralSettings['syncPlayerSettings']
  cuePauseDuration: PlayerSettings['cuePauseDuration']
  definitionTrigger: SubtitleSettings['definitionTrigger']
  transcriptionsLookup: TranscriptionsLookup
}

export default function SubtitleTranscriptions({ 
  transcriptions,
  styles,
  syncPlayerSettings,
  cuePauseDuration,
  definitionTrigger,
  transcriptionsLookup 
}: SubtitleTranscriptionsProps) {
  const player = usePlayerStore((state) => state.player);
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const delay = usePlayerStore((state) => state.delay);
  const pauseOnCue = usePlayerStore((state) => state.pauseOnCue);

  const [order, setOrder] = useState<SubtitleTranscription[]>(() => [...activeTranscriptions]);
  const debouncedOrder = useDebounce<SubtitleTranscription[]>(order, 1500);
  const hasUserDragged = useRef(false);

  const [pauseAt, setPauseAt] = useState<number | null>(null)
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);
  const [currentCueText, setCurrentCueText] = useState('');
  const handleActiveCuesIdsRef = useRef('');

  // This would stop the player from repausing it self if we are still in the small time window
  const lastPauseTime = useRef<number>(0);
    
  // const isFullscreen = useMediaState('fullscreen', player);
  // const controlsVisible = useMediaState('controlsVisible', player);
  // const currentTime = useMediaState('currentTime', player);
  const isFullscreen = true;
  const controlsVisible = true;
  const currentTime = 200;

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

  const getActiveSubtitleSets = useCallback(() => {
      if (!currentTime || !transcriptions.length) {
          return {
              japanese: [],
              hiragana: [],
              katakana: [],
              romaji: [],
              english: []
          };
      };
      
      const result: Record<SubtitleTranscription, SubtitleCue[]> = {
          japanese: [],
          hiragana: [],
          katakana: [],
          romaji: [],
          english: []
      };

      transcriptions.forEach(t => {
          if (t.cues) {
              const { transcription, cues } = t;
              const subtitleTranscription = transcription as SubtitleTranscription;
              
              const transcriptionDelay = ['hiragana', 'katakana', 'romaji', 'japanese'].includes(subtitleTranscription) 
                  ? delay.japanese 
                  : delay.english;
              
              const currentTimePlusBuffer = currentTime;
              
              const activeCues = cues.filter(cue => {
                  const startTime = cue.from + transcriptionDelay
                  const endTime = cue.to + transcriptionDelay
                  
                  return currentTimePlusBuffer >= startTime && currentTimePlusBuffer <= endTime;
              });
              
              result[transcription] = activeCues;
          }
      });

      return result;
  }, [transcriptions,  currentTime, delay]);

  const activeSubtitleSets = useMemo(() => getActiveSubtitleSets(), [getActiveSubtitleSets, transcriptions]);

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
      if (!player.current) return;

      const allActiveCues = Object.entries(activeSubtitleSets)
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
  }, [activeSubtitleSets, player, delay.japanese]);

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
                  if (!activeSubtitleSets[transcription]?.length) return null;

                  const tokenStyles =
                    styles[transcription]?.tokenStyles
                    || styles['all'].tokenStyles

                  const containerStyle = 
                    styles[transcription]?.containerStyle
                    || styles["all"].containerStyle

                  return (
                      <TranscriptionItem
                          key={transcription}
                          transcription={transcription}
                          activeSubtitleSets={activeSubtitleSets}
                          styles={{
                            tokenStyles: tokenStyles,
                            containerStyle: containerStyle
                          }}
                          definitionTrigger={definitionTrigger}
                          transcriptionsLookup={transcriptionsLookup}
                      />
                  );
              })}
          </SortableContext>
      </DndContext>
    </div>
  );
}