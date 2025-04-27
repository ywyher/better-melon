'use client'

import { useSubtitleTranscriptions } from "@/lib/queries/subtitle";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import type { SubtitleStyles } from "@/lib/db/schema";
import { timestampToSeconds } from "@/lib/subtitle";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import type { SubtitleCue, SubtitleFormat, SubtitleTranscription } from "@/types/subtitle";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMediaState } from "@vidstack/react";
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";

export type TranscriptionStyleSet = {
    tokenStyles: {
      default: CSSProperties;
      active: CSSProperties;
    };
    containerStyle: CSSProperties;
};

export const getTokenStyles = (
  isFullscreen: boolean, 
  styles: Partial<SubtitleStyles>
): { default: CSSProperties; active: CSSProperties } => {
  const fontSize = isFullscreen ? styles.fontSize || 24 : ((styles.fontSize || 24)/1.5);

  const defaultStyle: CSSProperties = {
    fontSize: fontSize,
    fontFamily: styles?.fontFamily || 'inherit',
    color: styles?.textColor || 'white',
    opacity: styles?.textOpacity || 1,
    WebkitTextStroke: styles?.textShadow === 'outline'
      ? (isFullscreen ? '.5px black' : '.3px black') 
      : 'none',
    fontWeight: 'bold',
    transition: 'all 0.15s ease',
    display: 'inline-block',
    textShadow: styles?.textShadow === 'drop-shadow' 
      ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
      : 'none',
    margin: '0 2px',
    cursor: 'pointer',
  };
  
  const activeStyle: CSSProperties = {
    fontSize: fontSize,
    fontFamily: styles?.fontFamily || 'inherit',
    color: '#4ade80',
    opacity: styles?.textOpacity || 1,
    WebkitTextStroke: '1px black',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)',
    margin: '0 2px',
    cursor: 'pointer',
  };

  return {
    default: defaultStyle,
    active: activeStyle
  };
};

const getContainerStyles = (styles: Partial<SubtitleStyles> | null): CSSProperties => {
  if (!styles) return {};
  
  return {
    backgroundColor: `color-mix(in oklab, ${styles.backgroundColor} ${(((styles.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: styles.backgroundBlur 
      ? `blur(${styles.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: styles.backgroundRadius 
      ? `${styles.backgroundRadius}px` 
      : '8px',
    padding: '.5rem 1rem',
    marginBottom: ".5rem",
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
    width: 'fit-content'
  };
};

export default function SubtitleTranscriptions({ subtitleQueries }: {
  subtitleQueries: UseQueryResult<{
      transcription: SubtitleTranscription;
      format: SubtitleFormat;
      cues: SubtitleCue[];
  }, Error>[]
}) {
  const player = usePlayerStore((state) => state.player);
  const activeTranscriptions = usePlayerStore((state) => state.activeTranscriptions);
  const delay = usePlayerStore((state) => state.delay);
  
  const isFullscreen = useMediaState('fullscreen', player);
  const controlsVisible = useMediaState('controlsVisible', player);
  const currentTime = useMediaState('currentTime', player);

  const styles = useSubtitleStylesStore((state) => state.styles);
  const getSubtitleStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
  
  const isLoading = subtitleQueries.some(query => query.isLoading);

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
      if (!currentTime) {
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
      
      subtitleQueries.forEach(query => {
          if (query.data?.cues) {
              const { transcription, cues, format } = query.data;
              const subtitleTranscription = transcription as SubtitleTranscription;
              
              const transcriptionDelay = ['hiragana', 'katakana', 'romaji', 'japanese'].includes(subtitleTranscription) 
                  ? delay.japanese 
                  : delay.english;
              
              const currentTimePlusBuffer = currentTime + 0.1;
              
              const activeCues = cues.filter(cue => {
                  const startTime = timestampToSeconds({ timestamp: cue.from, format });
                  const endTime = timestampToSeconds({ timestamp: cue.to, format });
                  const adjustedStartTime = startTime + transcriptionDelay;
                  const adjustedEndTime = endTime + transcriptionDelay;
                  
                  return currentTimePlusBuffer >= adjustedStartTime && currentTimePlusBuffer <= adjustedEndTime;
              });
              
              result[transcription] = activeCues;
          }
      });

      return result;
  }, [subtitleQueries, currentTime, delay]);

  const activeSubtitleSets = useMemo(() => getActiveSubtitleSets(), [getActiveSubtitleSets]);

  const subtitleStyles = useMemo(() => {
      const result: Record<SubtitleTranscription, TranscriptionStyleSet> = {} as Record<SubtitleTranscription, TranscriptionStyleSet>;
      
      order.forEach(transcription => {
          let styles = getSubtitleStylesFromStore(transcription);
          
          if (!styles) {
              styles = getSubtitleStylesFromStore('all');
          }
          
          if (!styles) {
              styles = defaultSubtitleStyles;
          }
          
          const tokenStyles = getTokenStyles(!!isFullscreen, styles);
          const containerStyle = getContainerStyles(styles);
          
          result[transcription] = {
              tokenStyles,
              containerStyle
          };
      });
      
      return result;
  }, [order, isFullscreen, getSubtitleStylesFromStore, styles]);

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

  if (isLoading) return <></>;

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
                    
                    return (
                        <TranscriptionItem
                            key={transcription}
                            transcription={transcription}
                            activeSubtitleSets={activeSubtitleSets}
                            styles={subtitleStyles[transcription]}
                        />
                    );
                })}
            </SortableContext>
        </DndContext>
    </div>
  );
}