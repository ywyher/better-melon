'use client'

import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { parseSubtitleToJson } from "@/lib/fetch-subs";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { cn } from "@/lib/utils";
import { SubtitleCue } from "@/types/subtitle";
import { useQueries } from "@tanstack/react-query";
import { useMediaState } from "@vidstack/react";
import { CSSProperties, useEffect, useMemo, useState } from "react";

// Define subtitle types for better code organization
const SUBTITLE_TYPES = ['japanese', 'hiragana', 'katakana', 'romaji'] as const;
type SubtitleType = typeof SUBTITLE_TYPES[number];

// Define default and active styles
const defaultTokenStyle: CSSProperties = {
  fontSize: '25px',
  color: 'white',
  WebkitTextStroke: '.5px black', // For Safari/Chrome
  fontWeight: 'bold',
  transition: 'all 0.15s ease',
  display: 'inline-block',
  margin: '0 1px',
};

const activeTokenStyle: CSSProperties = {
  fontSize: '25px',
  color: '#4ade80', // green-400
  WebkitTextStroke: '1px black',
  fontWeight: 'bold',
  textShadow: '0 0 10px rgba(74, 222, 128, 0.8)',
};

export default function Subs() {
    const player = useWatchStore((state) => state.player);
    const activeSubtitleFile = useWatchStore((state) => state.activeSubtitleFile);
    const currentTime = useMediaState('currentTime', player);
    const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null);
    const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);

    // Use useQueries to batch all subtitle queries together
    const subtitleQueries = useQueries({
        queries: SUBTITLE_TYPES.map(type => ({
            queryKey: ['subs', activeSubtitleFile, type],
            queryFn: async () => {
                if (!activeSubtitleFile?.url) {
                    throw new Error("Couldn't get the file");
                }
                
                // Only pass mode for non-Japanese types
                const mode = type === 'japanese' ? undefined : type;
                
                return {
                    type,
                    cues: await parseSubtitleToJson({ 
                        url: activeSubtitleFile.url, 
                        format: 'srt', 
                        mode 
                    })
                };
            },
            staleTime: Infinity,
            enabled: !!activeSubtitleFile?.url
        }))
    });

    // Extract loading states and results
    const isLoading = subtitleQueries.some(query => query.isLoading);
    
    // Find active cues for each subtitle type with proper typing
    const activeSubtitleSets = useMemo<Record<SubtitleType, SubtitleCue[]>>(() => {
        if (!currentTime) {
            return {
                japanese: [],
                hiragana: [],
                katakana: [],
                romaji: []
            };
        }
        
        const result: Record<SubtitleType, SubtitleCue[]> = {
            japanese: [],
            hiragana: [],
            katakana: [],
            romaji: []
        };
        
        subtitleQueries.forEach(query => {
            if (query.data?.cues) {
                const { type, cues } = query.data;
                
                result[type as SubtitleType] = cues.filter(cue => {
                    const startTime = srtTimestampToSeconds(cue.from);
                    const endTime = srtTimestampToSeconds(cue.to);
                    return currentTime >= startTime && currentTime <= endTime;
                });
            }
        });
        
        return result;
    }, [subtitleQueries, currentTime]);

    // Handle mouse enter/leave for token hover
    const handleTokenMouseEnter = (cueId: number, tokenIndex: number) => {
        setHoveredCueId(cueId);
        setHoveredTokenIndex(tokenIndex);
    };

    const handleTokenMouseLeave = () => {
        setHoveredCueId(null);
        setHoveredTokenIndex(null);
    };

    if (isLoading) return <>Loading...</>;

    return (
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center">
            {SUBTITLE_TYPES.map(type => (
                <div 
                    key={type} 
                    className={cn(
                        "subtitle-group w-full text-center mb-3",
                        `subtitle-${type}`
                    )}
                >
                    {activeSubtitleSets[type]?.map((cue, idx) => (
                        <span 
                            key={`${type}-cue-${idx}`}
                            className={`${type}`}
                        >
                            {cue.tokens?.length && cue.tokens?.map((token, tokenIdx) => {
                                // Check if the current token is in the same cue ID 
                                // and same position as the hovered token
                                const isActive = hoveredCueId === cue.id && hoveredTokenIndex === tokenIdx;
                                
                                return (
                                    <span 
                                        key={tokenIdx}
                                        style={{
                                            ...defaultTokenStyle,
                                            ...(isActive ? activeTokenStyle : {})
                                        }}
                                        onMouseEnter={() => handleTokenMouseEnter(cue.id, tokenIdx)}
                                        onMouseLeave={handleTokenMouseLeave}
                                        onMouseOver={(e) => {
                                            if (!isActive) {
                                                Object.assign(e.currentTarget.style, {
                                                    color: '#4ade80',
                                                    WebkitTextStroke: '1px black',
                                                    textStroke: '1px black',
                                                    fontWeight: 'bold',
                                                    textShadow: '0 0 10px rgba(74, 222, 128, 0.8)'
                                                });
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isActive) {
                                                Object.assign(e.currentTarget.style, {
                                                    color: 'white',
                                                    WebkitTextStroke: '0.5px black',
                                                    textStroke: '0.5px black',
                                                    fontWeight: 'normal',
                                                    textShadow: 'none'
                                                });
                                            }
                                        }}
                                    >
                                        {token.surface_form}
                                    </span>
                                );
                            })}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}