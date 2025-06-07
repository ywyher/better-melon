"use client"

import React, { Fragment, useCallback, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils';
import { TranscriptionsLookup, TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { SubtitleSettings } from '@/lib/db/schema';
import { getSentencesForCue, isTokenExcluded } from '@/lib/subtitle/utils';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  activeSubtitleSets: Record<SubtitleTranscription, SubtitleCue[]>;
  styles: TranscriptionStyleSet;
  definitionTrigger: SubtitleSettings['definitionTrigger']
  transcriptionsLookup: TranscriptionsLookup
}

export const TranscriptionItem = React.memo(function TranscriptionItem({ 
    transcription,
    activeSubtitleSets,
    styles,
    definitionTrigger,
    transcriptionsLookup
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
    const setSentences = useDefinitionStore((state) => state.setSentences);
    const storeSentences = useDefinitionStore((state) => state.sentences)
    const setToken = useDefinitionStore((state) => state.setToken);
    const storeToken = useDefinitionStore((state) => state.token)
    
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

    const handleActivate = useCallback(async (from: number, to: number, token: SubtitleToken, trigger: SubtitleSettings['definitionTrigger']) => {
        if (
            !from
            || !to
            || !token 
            || transcription == 'english' 
            || definitionTrigger != trigger
            || isTokenExcluded(token)
        ) return;

        await navigator.clipboard.writeText(token.surface_form);

        if (storeToken && storeToken.id === token.id) {
            // If clicking on the same token, clear it
            setToken(null);
            setSentences({
                kanji: null,
                kana: null,
                english: null,
            });
        } else {
            // Otherwise set the new token and sentence
            setToken(token);
            const sentences = getSentencesForCue(transcriptionsLookup, from, to);
            setSentences(sentences);
        }
    }, [storeToken, storeSentences, setToken, setSentences]);
  

    const renderTokens = useCallback((cue: SubtitleCue) => {
        if (!cue.tokens?.length) {
            return <span style={styles.tokenStyles.default}>{cue.content}</span>;
        }
        
        return cue.tokens.map((token, tokenIdx) => {
            const isActive = 
                (hoveredCueId === cue.id && hoveredTokenId === token.id && transcription !== 'english')
                || token.id === activeToken?.id;
            
            const tokenStyle = isActive ? styles.tokenStyles.active : styles.tokenStyles.default;
            const activeContainerStyle = styles.containerStyle.active
            
            return (
                <div
                    key={`${token.id || tokenIdx}-${tokenIdx}`}
                    style={{
                        ...(isActive ? activeContainerStyle : {}),
                    }}
                >
                    <span
                        style={tokenStyle}
                        onClick={() => {
                            handleActivate(cue.from, cue.to, token, 'click');
                        }}
                        onMouseEnter={() => {
                            handleTokenMouseEnter(cue.id, token.id)
                            handleActivate(cue.from, cue.to, token, 'hover');
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
                </div>
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