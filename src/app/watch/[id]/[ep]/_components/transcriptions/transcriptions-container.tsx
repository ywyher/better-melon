"use client"

import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import { SubtitleStyles } from "@/lib/db/schema";
import { timestampToSeconds } from "@/lib/funcs";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { useMediaStore } from "@/lib/stores/media-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { cn } from "@/lib/utils";
import { SubtitleCue, SubtitleFormat, SubtitleToken, SubtitleTranscription } from "@/types/subtitle";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { UseQueryResult } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { CSSProperties, Fragment, useCallback, useEffect, useMemo, useState } from "react";

type TranscriptionsContainerProps = {
    subtitleQueries: UseQueryResult<{
        transcription: SubtitleTranscription;
        format: SubtitleFormat;
        cues: SubtitleCue[];
    }, Error>[]
}

export type TranscriptionStyleSet = {
    tokenStyles: {
      default: CSSProperties;
      active: CSSProperties;
    };
    containerStyle: CSSProperties;
};

// const calculateFontSize = (isFullscreen: boolean, fontSize: number, activeTranscriptionsCount: number): string => {
//   const finalSize = isFullscreen ? fontSize : (fontSize/1.5);
//   return `${finalSize}px`;
// };

// Helper function to compute token styles
export const getTokenStyles = (
  isFullscreen: boolean, 
  styles: Partial<SubtitleStyles>
) => {
//   const fontSize = calculateFontSize(isFullscreen, styles.fontSize || 24, activeTranscriptionsCount);
  const fontSize = isFullscreen ? styles.fontSize || 24 : ((styles.fontSize || 24)/1.5)

  return {
    default: {
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
    } as CSSProperties,
    
    active: {
      fontSize: fontSize,
      fontFamily: styles?.fontFamily || 'inherit',
      color: '#4ade80', // Keeping the green for active tokens
      opacity: styles?.textOpacity || 1,
      WebkitTextStroke: '1px black',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)',
      margin: '0 2px',
      cursor: 'pointer',
    } as CSSProperties
  };
};

// Helper function to get container styles
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
  };
};
  
export default function TranscriptionsContainer({
    subtitleQueries
}: TranscriptionsContainerProps) {
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const player = useMediaStore((state) => state.player);
    const activeTranscriptions = useMediaStore((state) => state.activeTranscriptions);

    const [order, setOrder] = useState(activeTranscriptions);

    const isFullscreen = useMediaState('fullscreen', player);
    const controlsVisible = useMediaState('controlsVisible', player);

    const currentTime = useMediaState('currentTime', player);
    const delay = useMediaStore((state) => state.delay);


    const getSubtitleStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
    const stylesFromStore = useSubtitleStylesStore((state) => state.styles);
    
    // const activeTranscriptionsCount = activeTranscriptions.length;
    
    const activeSubtitleSets = useMemo<Record<SubtitleTranscription, SubtitleCue[]>>(() => {
        if (!currentTime) {
            return {
                japanese: [],
                hiragana: [],
                katakana: [],
                romaji: [],
                english: []
            };
        }
        
        const result: Record<SubtitleTranscription, SubtitleCue[]> = {
            japanese: [],
            hiragana: [],
            katakana: [],
            romaji: [],
            english: []
        };
        
        subtitleQueries.forEach(query => {
            if (query.data?.cues) {
                const { transcription, cues } = query.data;
                const subtitleTranscription = transcription as SubtitleTranscription;
                
                const transcriptionDelay = ['hiragana', 'katakana', 'romaji', 'japanese'].includes(subtitleTranscription) 
                    ? delay.japanese 
                    : delay.english;
                    
                result[transcription] = cues.filter(cue => {
                    const startTime = timestampToSeconds({ timestamp: cue.from, format: query.data.format })
                    const endTime = timestampToSeconds({ timestamp: cue.to, format: query.data.format })
                    
                    return (currentTime + .1) >= startTime + transcriptionDelay && (currentTime + .1) <= endTime + transcriptionDelay;
                });
            }
        });

        return result;
    }, [subtitleQueries, currentTime, delay]);

    const subtitleStyles = useMemo<Record<SubtitleTranscription, TranscriptionStyleSet>>(() => {
        const result: Record<SubtitleTranscription, TranscriptionStyleSet> = {} as Record<SubtitleTranscription, TranscriptionStyleSet>;
        
        activeTranscriptions.forEach(transcription => {
            let styles = getSubtitleStylesFromStore(transcription);
            
            // Fall back to 'all' styles if no specific styles
            if (!styles) {
                styles = getSubtitleStylesFromStore('all');
            }
            
            // Use default styles if nothing is found
            if (!styles) {
                styles = defaultSubtitleStyles
            }
            
            const tokenStyles = getTokenStyles(!!isFullscreen, styles);
            const containerStyle = getContainerStyles(styles);
            
            result[transcription] = {
                tokenStyles,
                containerStyle
            };
        });
        
        return result;
    }, [activeTranscriptions, isFullscreen, getSubtitleStylesFromStore, stylesFromStore]);

    const getBottomPosition = () => {
        if (isFullscreen) {
            return controlsVisible ? '5' : '2';
        }
        return controlsVisible ? '4' : '1';
    };

    const wrapperStyles = useMemo(() => {
        return {
            transition: 'bottom 0.3s ease',
            height: 'fit-content',
            bottom: `${getBottomPosition()}rem`
        } as CSSProperties;
    }, [getBottomPosition]);

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        
        if(!active || !over) return;
        if (active.id == over.id) return;
                
        setOrder((order) => {
            const oldIndex = order.indexOf(active.id.toString() as SubtitleTranscription);
            const newIndex = order.indexOf(over.id.toString() as SubtitleTranscription);
            
            return arrayMove(order, oldIndex, newIndex);
        });
    }

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
                    {activeTranscriptions.map(transcription => {
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
    )
}