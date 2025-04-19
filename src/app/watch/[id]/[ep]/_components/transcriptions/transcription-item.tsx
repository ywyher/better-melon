"use client"

import React, { Fragment, useCallback, useState } from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions-container';

type TranscriptionItemProps = {
    transcription: SubtitleTranscription;
    activeSubtitleSets: Record<SubtitleTranscription, SubtitleCue[]>;
    styles: TranscriptionStyleSet
}

export function TranscriptionItem({ 
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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const activeToken = useDefinitionStore((state) => state.token);
    const setSentance = useDefinitionStore((state) => state.setSentance);
    const setToken = useDefinitionStore((state) => state.setToken);
    const [hoveredTokenId, setHoveredTokenId] = useState<string | number | null>(null);
    const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);
    

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
  
  return (
    <div
        ref={setNodeRef}
        style={{
            ...styles.containerStyle,
            ...style,
        }}
        {...attributes}
        {...listeners}
    >
        {activeSubtitleSets[transcription]?.map((cue, idx) => (
            <Fragment key={idx}>
                {cue.tokens?.length ? (
                    cue.tokens.map((token, tokenIdx) => {
                        const isActive = 
                            (hoveredCueId === cue.id && (hoveredTokenId === token.id && transcription != 'english'))
                            || token.id == activeToken?.id
                        
                        return (
                            <span 
                                key={tokenIdx}
                                style={isActive ? styles.tokenStyles.active : styles.tokenStyles.default}
                                onClick={() => {
                                    handleClick(cue.content, token)
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
                    })
                ) : (
                    <span style={styles.tokenStyles.default}>{cue.content}</span>
                )}
            </Fragment>
        ))}
    </div>
  );
}