'use client'

import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { subtitleScripts } from "@/lib/constants";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds, vttTimestampToSeconds } from "@/lib/funcs";
import { useInfoCardStore } from "@/lib/stores/info-card-store";
import { cn } from "@/lib/utils";
import { SubtitleCue, SubtitleToken } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { CSSProperties, Fragment, useCallback, useMemo, useState } from "react";

type SubtitleType = typeof subtitleScripts[number];

const calculateFontSize = (isFullscreen: boolean, activeScriptsCount: number): string => {
  const fullscreenBaseSize = 40;
  const normalBaseSize = 24;
  
  const reductionFactor = isFullscreen ? 4 : 2;
  
  const additionalScripts = Math.max(0, activeScriptsCount - 1);
  const reduction = additionalScripts * reductionFactor;
  
  const baseSize = isFullscreen ? fullscreenBaseSize : normalBaseSize;
  const finalSize = Math.max(baseSize - reduction, isFullscreen ? 24 : 16);
  
  return `${finalSize}px`;
};

const getTokenStyles = (isFullscreen: boolean, activeScriptsCount: number) => {
  const fontSize = calculateFontSize(isFullscreen, activeScriptsCount);
  
  return {
    default: {
      fontSize: fontSize,
      color: 'white',
      WebkitTextStroke: isFullscreen ? '.5px black' : '.3px black',
      fontWeight: 'bold',
      transition: 'all 0.15s ease',
      display: 'inline-block',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
      margin: '0 2px',
      cursor: 'pointer'
    } as CSSProperties,
    
    active: {
      fontSize: fontSize,
      color: '#4ade80', // green-400
      WebkitTextStroke: isFullscreen ? '1px black' : '.5px black',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.9)',
      margin: '0 2px',
      cursor: 'pointer'
    } as CSSProperties
  };
};

export default function Subtitle() {
    const player = useWatchStore((state) => state.player);
    const englishSubtitleUrl = useWatchStore((state) => state.englishSubtitleUrl) || "";
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const activeToken = useInfoCardStore((state) => state.token)
    const setSentance = useInfoCardStore((state) => state.setSentance)
    const setToken = useInfoCardStore((state) => state.setToken)
    
    const currentTime = useMediaState('currentTime', player);
    const isFullscreen = useMediaState('fullscreen', player);
    const controlsVisible = useMediaState('controlsVisible', player);

    // Changed from hoveredTokenIndex to hoveredTokenId
    const [hoveredTokenId, setHoveredTokenId] = useState<string | number | null>(null);
    const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);

    const activeScripts = useWatchStore((state) => state.activeScripts);
    const delay = useWatchStore((state) => state.delay);

    const activeScriptsCount = activeScripts.length;
    
    const tokenStyles = useMemo(
      () => getTokenStyles(!!isFullscreen, activeScriptsCount),
      [isFullscreen, activeScriptsCount]
    );

    const subtitleQueries = useQueries({
        queries: subtitleScripts.filter(type => activeScripts.includes(type)).map(type => ({
            queryKey: ['subs', type, type === 'english' 
                ? englishSubtitleUrl 
                : activeSubtitleFile?.source == 'remote' 
                    ? activeSubtitleFile?.file.url 
                    :  activeSubtitleFile?.file
            ],
            queryFn: async () => {
                if ((type !== 'english' && activeSubtitleFile?.source == 'remote' ? !activeSubtitleFile?.file.url : !activeSubtitleFile?.file) || 
                    (type === 'english' && !englishSubtitleUrl)) {
                    throw new Error(`Couldn't get the file for ${type} subtitles`);
                }

                const source = type === 'english' ? englishSubtitleUrl : activeSubtitleFile?.source == 'remote' ? activeSubtitleFile!.file.url : activeSubtitleFile!.file;
                const format = type === 'english' ? englishSubtitleUrl.split('.').pop() as "srt" | "vtt"
                    : activeSubtitleFile?.source == 'remote' 
                    ? activeSubtitleFile!.file.url.split('.').pop() as "srt" | "vtt"
                    : activeSubtitleFile!.file.name.split('.').pop() as "srt" | "vtt";
                
                const cues = await parseSubtitleToJson({ 
                    source,
                    format,
                    script: type
                });
                
                return {
                    type,
                    cues
                };
            },
            staleTime: Infinity,
            enabled:
                (type === 'english' ? !!englishSubtitleUrl : 
                    activeSubtitleFile?.source == 'remote' 
                        ? !!activeSubtitleFile?.file.url 
                        : !!activeSubtitleFile?.file) 
                            && activeScripts.includes(type)
        }))
    });

    const isLoading = subtitleQueries.some(query => query.isLoading);

    const activeSubtitleSets = useMemo<Record<SubtitleType, SubtitleCue[]>>(() => {
        if (!currentTime) {
            return {
                japanese: [],
                hiragana: [],
                katakana: [],
                romaji: [],
                english: []
            };
        }
        
        const result: Record<SubtitleType, SubtitleCue[]> = {
            japanese: [],
            hiragana: [],
            katakana: [],
            romaji: [],
            english: []
        };
        
        subtitleQueries.forEach(query => {
            if (query.data?.cues) {
                const { type, cues } = query.data;
                const subtitleType = type as SubtitleType;
                
                const typeDelay = ['hiragana', 'katakana', 'romaji', 'japanese'].includes(subtitleType) 
                    ? delay.japanese 
                    : delay.english;
                    
                result[type] = cues.filter(cue => {
                    const startTime = subtitleType !== 'english'
                        ? srtTimestampToSeconds(cue.from)
                        : vttTimestampToSeconds(cue.from);
                    
                    const endTime = subtitleType !== "english"
                        ? srtTimestampToSeconds(cue.to)
                        : vttTimestampToSeconds(cue.to);
                    
                    return (currentTime + .1) >= startTime + typeDelay && (currentTime + .1) <= endTime + typeDelay;
                });
            }
        });

        return result;
    }, [subtitleQueries, currentTime, delay]);

    // Updated to use token.id instead of index
    const handleTokenMouseEnter = (cueId: number, tokenId: string | number) => {
        console.log('yoo')
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

    if (isLoading) return <></>;

    return (
        <div 
            className={cn(
                "absolute left-1/2 transform -translate-x-1/2 flex",
                "flex-col items-center w-[100%] px-4 py-2 rounded-lg bg-black bg-opacity-30",
                `bottom-${getBottomPosition()}`,
            )}
            style={{
                transition: 'bottom 0.3s ease',
                bottom: `${getBottomPosition()}rem`
            }}
        >
            {subtitleScripts.filter(type => activeScripts.includes(type)).map(type => (
                <div 
                    key={type}
                    className={cn(
                        "subtitle-group w-full text-center mb-2",
                        `subtitle-${type}`,
                        type == "english" && "flex flex-row flex-wrap justify-center gap-1"
                    )}
                >
                    {activeSubtitleSets[type]?.map((cue, idx) => (
                        <Fragment key={idx}>
                            {cue.tokens?.length ? (
                                cue.tokens.map((token, tokenIdx) => {
                                    // Using token.id instead of tokenIdx for comparison
                                    const isActive = 
                                        (hoveredCueId === cue.id && (hoveredTokenId === token.id && type != 'english'))
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
                                                    Object.assign(e.currentTarget.style, {
                                                        color: 'white',
                                                        WebkitTextStroke: isFullscreen ? '.5px black' : '.3px black',
                                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                                                    });
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
            ))}
        </div>
    );
}