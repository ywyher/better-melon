'use client'

import { getGlobalSubtitleSettings } from "@/app/settings/subtitle/actions";
import { defaultSubtitleSettings } from "@/app/settings/subtitle/constants";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { subtitleTranscriptions } from "@/lib/constants";
import { SubtitleSettings } from "@/lib/db/schema";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds, vttTimestampToSeconds } from "@/lib/funcs";
import { useInfoCardStore } from "@/lib/stores/info-card-store";
import { useSubtitleSettingsStore } from "@/lib/stores/subtitle-settings-store";
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
  settings: Partial<SubtitleSettings>
) => {
  const fontSize = settings?.fontSize 
    ? `${settings.fontSize}px` 
    : calculateFontSize(isFullscreen, activeTranscriptionsCount);

  return {
    default: {
      fontSize: fontSize,
      fontFamily: settings?.fontFamily || 'inherit',
      color: settings?.textColor || 'white',
      opacity: settings?.textOpacity || 1,
      WebkitTextStroke: settings?.textShadow === 'outline'
        ? (isFullscreen ? '.5px black' : '.3px black') 
        : 'none',
      fontWeight: 'bold',
      transition: 'all 0.15s ease',
      display: 'inline-block',
      textShadow: settings?.textShadow === 'drop-shadow' 
        ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
        : 'none',
      margin: '0 2px',
      cursor: 'pointer',
    } as CSSProperties,
    
    active: {
      fontSize: fontSize,
      fontFamily: settings?.fontFamily || 'inherit',
      color: '#4ade80', // Keeping the green for active tokens
      opacity: settings?.textOpacity || 1,
      WebkitTextStroke: settings?.textShadow === 'outline'
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
const getContainerStyles = (settings: Partial<SubtitleSettings> | null): CSSProperties => {
  if (!settings) return {};
  
  return {
    backgroundColor: `color-mix(in oklab, ${settings.backgroundColor} ${(((settings.backgroundOpacity || 0) * 100))}%, transparent)`,
    backdropFilter: settings.backgroundBlur 
      ? `blur(${settings.backgroundBlur * 4}px)` 
      : 'none',
    borderRadius: settings.backgroundRadius 
      ? `${settings.backgroundRadius}px` 
      : '8px',
    padding: '.5rem 1rem',
    marginBottom: ".5rem",
  };
};

export default function SubtitleTranscriptions() {
    const player = useWatchStore((state) => state.player);
    const englishSubtitleUrl = useWatchStore((state) => state.englishSubtitleUrl) || "";
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const activeToken = useInfoCardStore((state) => state.token);
    const setSentance = useInfoCardStore((state) => state.setSentance);
    const setToken = useInfoCardStore((state) => state.setToken);
    
    const currentTime = useMediaState('currentTime', player);
    const isFullscreen = useMediaState('fullscreen', player);
    const controlsVisible = useMediaState('controlsVisible', player);

    const [hoveredTokenId, setHoveredTokenId] = useState<string | number | null>(null);
    const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);

    const activeTranscriptions = useWatchStore((state) => state.activeTranscriptions);
    const delay = useWatchStore((state) => state.delay);

    // Get the settings from the store
    const getSubtitleSettingsFromStore = useSubtitleSettingsStore((state) => state.getSettings);
    const addSubtitleSettingsInStore = useSubtitleSettingsStore((state) => state.addSettings);
    const settingsFromStore = useSubtitleSettingsStore((state) => state.settings);

    const activeTranscriptionsCount = activeTranscriptions.length;

    const subtitleStyles = useMemo<Record<SubtitleTranscription, StyleSet>>(() => {
        const result: Record<SubtitleTranscription, StyleSet> = {} as Record<SubtitleTranscription, StyleSet>;
        
        activeTranscriptions.forEach(transcription => {
            let settings = getSubtitleSettingsFromStore(transcription);
            
            // Fall back to 'all' settings if no specific settings
            if (!settings) {
                settings = getSubtitleSettingsFromStore('all');
            }
            
            // Use default settings if nothing is found
            if (!settings) {
                settings = defaultSubtitleSettings
            }
            
            const tokenStyles = getTokenStyles(!!isFullscreen, activeTranscriptionsCount, settings);
            const containerStyle = getContainerStyles(settings);
            
            result[transcription] = {
                tokenStyles,
                containerStyle
            };
        });
        
        return result;
    }, [activeTranscriptions, isFullscreen, activeTranscriptionsCount, getSubtitleSettingsFromStore, settingsFromStore]);

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

                let settings = await getGlobalSubtitleSettings({ transcription });
                
                if(JSON.stringify(settings) == JSON.stringify(defaultSubtitleSettings)) {
                    settings = await getGlobalSubtitleSettings({ transcription: 'all' });
                    addSubtitleSettingsInStore('all', settings)
                }else {
                    addSubtitleSettingsInStore(transcription, settings)
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