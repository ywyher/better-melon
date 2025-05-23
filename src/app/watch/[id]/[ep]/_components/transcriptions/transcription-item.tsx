"use client"

import React, { Fragment, useCallback, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { SubtitleSettings } from '@/lib/db/schema';
import { isTokenExcluded } from '@/lib/subtitle/utils';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  activeSubtitleSets: Record<SubtitleTranscription, SubtitleCue[]>;
  styles: TranscriptionStyleSet;
  definitionTrigger: SubtitleSettings['definitionTrigger']
}

export const TranscriptionItem = React.memo(function TranscriptionItem({ 
    transcription,
    activeSubtitleSets,
    styles,
    definitionTrigger
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
    const setSentence = useDefinitionStore((state) => state.setSentence);
    const setToken = useDefinitionStore((state) => state.setToken);
    const storeToken = useDefinitionStore((state) => state.token)
    const storeSentence = useDefinitionStore((state) => state.sentence)
    
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

    const handleActivate = useCallback((sentence: string, token: SubtitleToken, trigger: SubtitleSettings['definitionTrigger']) => {
        if (
            !sentence 
            || !token 
            || transcription == 'english' 
            || definitionTrigger != trigger
            || isTokenExcluded(token)
        ) return;

        if (storeToken && storeToken.id === token.id) {
            // If clicking on the same token, clear it
            setToken(null);
            setSentence(null);
        } else {
            // Otherwise set the new token and sentence
            setToken(token);
            setSentence(sentence);
        }
    }, [storeToken, storeSentence, setToken, setSentence]);
  

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
                        handleActivate(cue.content, token, 'click');
                    }}
                    onMouseEnter={() => {
                        handleTokenMouseEnter(cue.id, token.id)
                        handleActivate(cue.content, token, 'hover');
                    }}
                    onMouseLeave={() => { 
                        handleTokenMouseLeave()
                    }}
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
        handleActivate, 
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
                ...styles.containerStyle.default,
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