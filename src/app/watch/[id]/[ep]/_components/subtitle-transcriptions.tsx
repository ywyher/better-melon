'use client'

import { getSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/actions";
import { defaultSubtitleStyles } from "@/app/settings/subtitle/_subtitle-styles/constants";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { subtitleTranscriptions } from "@/lib/constants";
import { SubtitleStyles } from "@/lib/db/schema";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds, vttTimestampToSeconds } from "@/lib/funcs";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { useSubtitleStylesStore } from "@/lib/stores/subtitle-styles-store";
import { cn } from "@/lib/utils";
import { SubtitleCue, SubtitleToken } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { CSSProperties, Fragment, useCallback, useEffect, useMemo, useState } from "react";

type SubtitleTranscription = typeof subtitleTranscriptions[number];

type StyleSet = {
  tokenStyles: {
    default: CSSProperties;
    active: CSSProperties;
  };
  containerStyle: CSSProperties;
};

const calculateFontSize = (isFullscreen: boolean, activeTranscriptionsCount: number): string => {
  const fullscreenBaseSize = 40;
  const normalBaseSize = 24;
  
  const reductionFactor = isFullscreen ? 4 : 2;
  
  const additionalScripts = Math.max(0, activeTranscriptionsCount - 1);
  const reduction = additionalScripts * reductionFactor;
  
  const baseSize = isFullscreen ? fullscreenBaseSize : normalBaseSize;
  const finalSize = Math.max(baseSize - reduction, isFullscreen ? 24 : 16);
  
  return `${finalSize}px`;
};

// Helper function to compute token styles
const getTokenStyles = (
  isFullscreen: boolean, 
  activeTranscriptionsCount: number, 
  styles: Partial<SubtitleStyles>
) => {
  const fontSize = styles?.fontSize 
    ? `${styles.fontSize}px` 
    : calculateFontSize(isFullscreen, activeTranscriptionsCount);

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
      WebkitTextStroke: styles?.textShadow === 'outline'
        ? (isFullscreen ? '1px black' : '.5px black')
        : 'none',
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

export default function SubtitleTranscriptions() {
    const player = useWatchStore((state) => state.player);
    const englishSubtitleUrl = useWatchStore((state) => state.englishSubtitleUrl) || "";
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const activeToken = useDefinitionStore((state) => state.token);
    const setSentance = useDefinitionStore((state) => state.setSentance);
    const setToken = useDefinitionStore((state) => state.setToken);
    
    const currentTime = useMediaState('currentTime', player);
    const isFullscreen = useMediaState('fullscreen', player);
    const controlsVisible = useMediaState('controlsVisible', player);

    const [hoveredTokenId, setHoveredTokenId] = useState<string | number | null>(null);
    const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);

    const activeTranscriptions = useWatchStore((state) => state.activeTranscriptions);
    const delay = useWatchStore((state) => state.delay);

    // Get the styles from the store
    const getSubtitleStylesFromStore = useSubtitleStylesStore((state) => state.getStyles);
    const addSubtitleStylesInStore = useSubtitleStylesStore((state) => state.addStyles);
    const stylesFromStore = useSubtitleStylesStore((state) => state.styles);

    const activeTranscriptionsCount = activeTranscriptions.length;

    const subtitleStyles = useMemo<Record<SubtitleTranscription, StyleSet>>(() => {
        const result: Record<SubtitleTranscription, StyleSet> = {} as Record<SubtitleTranscription, StyleSet>;
        
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
            
            const tokenStyles = getTokenStyles(!!isFullscreen, activeTranscriptionsCount, styles);
            const containerStyle = getContainerStyles(styles);
            
            result[transcription] = {
                tokenStyles,
                containerStyle
            };
        });
        
        return result;
    }, [activeTranscriptions, isFullscreen, activeTranscriptionsCount, getSubtitleStylesFromStore, stylesFromStore]);

    const subtitleQueries = useQueries({
        queries: subtitleTranscriptions.filter(transcription => activeTranscriptions.includes(transcription)).map(transcription => ({
            queryKey: ['subs', transcription, transcription === 'english' 
                ? englishSubtitleUrl 
                : activeSubtitleFile?.source == 'remote'
                    ? activeSubtitleFile?.file.url 
                    :  activeSubtitleFile?.file
            ],
            queryFn: async () => {
                if ((transcription !== 'english' && activeSubtitleFile?.source == 'remote' ? !activeSubtitleFile?.file.url : !activeSubtitleFile?.file) || 
                    (transcription === 'english' && !englishSubtitleUrl)) {
                    throw new Error(`Couldn't get the file for ${transcription} subtitles`);
                }

                const source = transcription === 'english' 
                ? englishSubtitleUrl 
                : activeSubtitleFile?.source == 'remote' 
                    ? activeSubtitleFile!.file.url 
                    : activeSubtitleFile!.file;
                
                const format = transcription === 'english' 
                    ? englishSubtitleUrl.split('.').pop() as "srt" | "vtt"
                        : activeSubtitleFile?.source == 'remote' 
                            ? activeSubtitleFile!.file.url.split('.').pop() as "srt" | "vtt"
                            : activeSubtitleFile!.file.name.split('.').pop() as "srt" | "vtt";

                let styles = await getSubtitleStyles({ transcription });
                
                if(JSON.stringify(styles) == JSON.stringify(defaultSubtitleStyles)) {
                    styles = await getSubtitleStyles({ transcription: 'all' });
                    addSubtitleStylesInStore('all', styles)
                }else {
                    addSubtitleStylesInStore(transcription, styles)
                }
                
                const cues = await parseSubtitleToJson({ 
                    source,
                    format,
                    transcription
                });
                
                return {
                    transcription,
                    cues
                };
            },
            staleTime: Infinity,
            enabled:
                (transcription === 'english' ? !!englishSubtitleUrl : 
                    activeSubtitleFile?.source == 'remote' 
                        ? !!activeSubtitleFile?.file.url 
                        : !!activeSubtitleFile?.file)
                            && activeTranscriptions.includes(transcription),
        }))
    });

    const isLoading = subtitleQueries.some(query => query.isLoading);

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
                    const startTime = transcription !== 'english'
                        ? srtTimestampToSeconds(cue.from)
                        : vttTimestampToSeconds(cue.from);
                    
                    const endTime = transcription !== "english"
                        ? srtTimestampToSeconds(cue.to)
                        : vttTimestampToSeconds(cue.to);
                    
                    return (currentTime + .1) >= startTime + transcriptionDelay && (currentTime + .1) <= endTime + transcriptionDelay;
                });
            }
        });

        return result;
    }, [subtitleQueries, currentTime, delay]);

    const handleTokenMouseEnter = (cueId: number, tokenId: string | number) => {
        setHoveredCueId(cueId);
        setHoveredTokenId(tokenId);
    };

    const handleTokenMouseLeave = useCallback(() => {
        setHoveredCueId(null);
        setHoveredTokenId(null);
    }, [setHoveredCueId, setHoveredTokenId]);

    const handleClick = useCallback((sentance: string, token: SubtitleToken) => {
        if(!sentance || !token) return;
        setSentance(sentance)
        setToken(token)
    }, [setSentance, setToken])
    
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

    if (isLoading) return <></>;

    return (
        <div 
            className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center w-[100%]"
            style={wrapperStyles}
        >
            {subtitleTranscriptions.filter(transcription => activeTranscriptions.includes(transcription)).map(transcription => {
                // Skip rendering if no subtitles for this transcription
                if (!activeSubtitleSets[transcription]?.length) return null;
                
                // Get the styles for this transcription
                const { tokenStyles, containerStyle } = subtitleStyles[transcription] || {
                    tokenStyles: getTokenStyles(!!isFullscreen, activeTranscriptionsCount, {}),
                    containerStyle: {}
                };
                
                return (
                    <div 
                        key={transcription}
                        className={cn(
                            "w-fit text-center",
                            transcription == "english" && "flex flex-row flex-wrap justify-center gap-1"
                        )}
                        style={containerStyle}
                    >
                        {activeSubtitleSets[transcription]?.map((cue, idx) => (
                            <Fragment key={idx}>
                                {cue.tokens?.length ? (
                                    cue.tokens.map((token, tokenIdx) => {
                                        // Using token.id instead of tokenIdx for comparison
                                        const isActive = 
                                            (hoveredCueId === cue.id && (hoveredTokenId === token.id && transcription != 'english'))
                                            || token.id == activeToken?.id
                                        
                                        return (
                                            <span 
                                                key={tokenIdx}
                                                style={isActive ? tokenStyles.active : tokenStyles.default}
                                                onClick={() => {
                                                    handleClick(cue.content, token)
                                                }}
                                                onMouseEnter={() => handleTokenMouseEnter(cue.id, token.id)}
                                                onMouseLeave={handleTokenMouseLeave}
                                                onMouseOver={(e) => {
                                                    if (!isActive) {
                                                        Object.assign(e.currentTarget.style, {
                                                            color: '#4ade80',
                                                            WebkitTextStroke: isFullscreen ? '1px black' : '.5px black',
                                                            textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)'
                                                        });
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!isActive) {
                                                        Object.assign(e.currentTarget.style, tokenStyles.default);
                                                    }
                                                }}
                                            >
                                                {token.surface_form}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span style={tokenStyles.default}>{cue.content}</span>
                                )}
                            </Fragment>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}