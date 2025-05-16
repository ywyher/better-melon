'use client'

import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import { timestampToSeconds } from "@/lib/subtitle/utils";
import { usePlayerStore } from "@/lib/stores/player-store";
import type { SubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMediaState } from "@vidstack/react";
import { useCallback, useMemo, useState } from "react";
import { TranscriptionQuery, TranscriptionStyles } from "@/app/watch/[id]/[ep]/types";

export default function SubtitleTranscriptions({ transcriptions, styles }: {
  transcriptions: TranscriptionQuery[];
  styles: TranscriptionStyles
}) {
  // const player = usePlayerStore((state) => state.player);
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const delay = usePlayerStore((state) => state.delay);
  
  // const isFullscreen = useMediaState('fullscreen', player);
  const isFullscreen = true;
  // const controlsVisible = useMediaState('controlsVisible', player);
  const controlsVisible = true;
  // const currentTime = useMediaState('currentTime', player);
  const currentTime = 1200;

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
  
  const [order, setOrder] = useState<SubtitleTranscription[]>(() => [...activeTranscriptions]);

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
              const { transcription, cues, format } = t;
              const subtitleTranscription = transcription as SubtitleTranscription;
              
              const transcriptionDelay = ['hiragana', 'katakana', 'romaji', 'japanese'].includes(subtitleTranscription) 
                  ? delay.japanese 
                  : delay.english;
              
              const currentTimePlusBuffer = currentTime;
              
              const activeCues = cues.filter(cue => {
                  const startTime = timestampToSeconds({ timestamp: cue.from, format, delay: transcriptionDelay });
                  const endTime = timestampToSeconds({ timestamp: cue.to, format, delay: transcriptionDelay });
                  
                  return currentTimePlusBuffer >= startTime && currentTimePlusBuffer <= endTime;
              });
              
              result[transcription] = activeCues;
          }
      });

      return result;
  }, [transcriptions,  currentTime, delay]);

  const activeSubtitleSets = useMemo(() => getActiveSubtitleSets(), [getActiveSubtitleSets]);
  
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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
      const {active, over} = event;
      
      if(!active || !over || active.id === over.id) return;
              
      setOrder(currentOrder => {
          const oldIndex = currentOrder.indexOf(active.id.toString() as SubtitleTranscription);
          const newIndex = currentOrder.indexOf(over.id.toString() as SubtitleTranscription);
          
          return arrayMove(currentOrder, oldIndex, newIndex);
      });
  }, []);

  return (
    <div
        className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center w-[100%]"
        style={wrapperStyles}
    >
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
                        />
                    );
                })}
            </SortableContext>
        </DndContext>
    </div>
  );
}

