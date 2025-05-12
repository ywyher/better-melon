"use client"

import React, { Fragment, useCallback, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  activeSubtitleSets: Record<SubtitleTranscription, SubtitleCue[]>;
  styles: TranscriptionStyleSet;
}

export const TranscriptionItem = React.memo(function TranscriptionItem({ 
    transcription,
    activeSubtitleSets,
    styles
}: TranscriptionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: transcription});

    const style = useMemo(() => ({
        transform: CSS.Transform.toString(transform),
        transition,
    }), [transform, transition]);

    const activeToken = useDefinitionStore((state) => state.token);
    const setSentance = useDefinitionStore((state) => state.setSentance);
    const setToken = useDefinitionStore((state) => state.setToken);
    const storeToken = useDefinitionStore((state) => state.token)
    const storeSentance = useDefinitionStore((state) => state.sentance)
    
    const [hoveredTokenId, setHoveredTokenId] = useState<string | number | null>(null);
    const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);
    
    const handleTokenMouseEnter = useCallback((cueId: number, tokenId: string | number) => {
        setHoveredCueId(cueId);
        setHoveredTokenId(tokenId);
    }, []);

    const handleTokenMouseLeave = useCallback(() => {
        setHoveredCueId(null);
        setHoveredTokenId(null);
    }, []);

    const handleClick = useCallback((sentence: string, token: SubtitleToken) => {
      if (!sentence || !token) return;
      
      // Toggle token - if current stored token matches clicked token, clear it; otherwise set the new token
      if (storeToken && storeToken.id === token.id) {
        setToken(null);
      } else {
        setToken(token);
      }
      
      // Toggle sentence - if current stored sentence matches clicked sentence, clear it; otherwise set the new sentence
      if (storeSentance && storeSentance === sentence) {
        setSentance(null);
      } else {
        setSentance(sentence);
      }
    }, [storeToken, storeSentance, setToken, setSentance]);
  

    const renderTokens = useCallback((cue: SubtitleCue) => {
        if (!cue.tokens?.length) {
            return <span style={styles.tokenStyles.default}>{cue.content}</span>;
        }
        
        return cue.tokens.map((token, tokenIdx) => {
            const isActive = 
                (hoveredCueId === cue.id && hoveredTokenId === token.id && transcription !== 'english')
                || token.id === activeToken?.id;
            
            const tokenStyle = isActive ? styles.tokenStyles.active : styles.tokenStyles.default;
            
            return (
                <span 
                    key={`${token.id || tokenIdx}-${tokenIdx}`} // More stable keys
                    style={tokenStyle}
                    onClick={() => {
                        if(transcription !== 'english') {
                            handleClick(cue.content, token);
                        }
                    }}
                    onMouseEnter={() => handleTokenMouseEnter(cue.id, token.id)}
                    onMouseLeave={handleTokenMouseLeave}
                    onMouseOver={(e) => {
                        if (!isActive) {
                            Object.assign(e.currentTarget.style, styles.tokenStyles.active);
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isActive) {
                            Object.assign(e.currentTarget.style, styles.tokenStyles.default);
                        }
                    }}
                >
                    {token.surface_form}
                </span>
            );
        });
    }, [
        styles, // Important: ensure renderTokens updates when styles change
        hoveredCueId, 
        hoveredTokenId, 
        transcription, 
        activeToken, 
        handleClick, 
        handleTokenMouseLeave, 
        handleTokenMouseEnter
    ]);
    
    // Memoize container className
    const containerClassName = useMemo(() => 
        cn(transcription === 'english' && 'flex flex-row gap-1'),
        [transcription]
    );
    
    // Get only the cues we need for this transcription
    const activeCues = activeSubtitleSets[transcription] || [];

    return (
        <div
            ref={setNodeRef}
            style={{
                ...styles.containerStyle,
                ...style,
            }}
            className={containerClassName}
            {...attributes}
            {...listeners}
        >
            {activeCues.map((cue, idx) => (
                <Fragment key={`cue-${cue.id || idx}`}>
                    {renderTokens(cue)}
                </Fragment>
            ))}
        </div>
    );
});