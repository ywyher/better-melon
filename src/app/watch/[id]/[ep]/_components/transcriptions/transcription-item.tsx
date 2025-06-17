"use client"

import React, { Fragment, useCallback, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils/utils';
import { PitchLookup, Subtitle, TranscriptionsLookup, TranscriptionStyleSet, WordsLookup } from '@/app/watch/[id]/[ep]/types';
import { SubtitleSettings, WordSettings } from '@/lib/db/schema';
import { getSentencesForCue, isTokenExcluded, parseFuriganaToken } from '@/lib/utils/subtitle';
import { useDelayStore } from '@/lib/stores/delay-store';
import DOMPurify from 'dompurify';
import { GripVertical } from 'lucide-react';
import { getPitchAccentType } from '@/lib/utils/pitch';
import { pitchAccentsStyles } from '@/lib/constants/pitch';
import { PitchAccents } from '@/types/pitch';
import { learningStatusesStyles } from '@/lib/constants/subtitle';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  activeSubtitles: Subtitle;
  styles: TranscriptionStyleSet;
  definitionTrigger: SubtitleSettings['definitionTrigger']
  transcriptionsLookup: TranscriptionsLookup;
  japaneseStyles: TranscriptionStyleSet;
  learningStatus: WordSettings['learningStatus']
  pitchColoring: WordSettings['pitchColoring']
  wordsLookup: WordsLookup
  pitchLookup: PitchLookup
}

export const TranscriptionItem = React.memo(function TranscriptionItem({ 
    transcription,
    activeSubtitles,
    styles,
    definitionTrigger,
    transcriptionsLookup,
    japaneseStyles,
    learningStatus,
    pitchColoring,
    wordsLookup,
    pitchLookup
}: TranscriptionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: transcription,
        disabled: false
    });
    const delay = useDelayStore((state) => state.delay);

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
            const sentences = getSentencesForCue(transcriptionsLookup, from, to, delay);
            setSentences(sentences);
        }
    }, [storeToken, storeSentences, setToken, setSentences]);
  

    const renderTokens = useCallback((cue: SubtitleCue) => {
        if (!cue.tokens?.length) {
            return <span style={styles.tokenStyles.default}>{cue.content}</span>;
        }
        
        return cue.tokens.map((token, tokenIdx) => {
            const pitch = pitchLookup.get(
                cue.transcription != 'japanese' && cue.transcription != 'english'
                ? token.original_form!
                : token.surface_form
            )
            let accent: PitchAccents | null = null;
            if(pitch) {
                accent = getPitchAccentType({
                    position: pitch.pitches[0].position,
                    reading: token.original_form
                })
            }

            const word = wordsLookup.get(token.original_form)
            const status = word?.status
            
            const isActive = 
                (hoveredCueId === cue.id && hoveredTokenId === token.id && transcription !== 'english')
                || token.id === activeToken?.id;
            
            const tokenStyle = {
                ...(isActive ? styles.tokenStyles.active : styles.tokenStyles.default),
                ...(pitchColoring && !isActive && accent ? pitchAccentsStyles[accent] : undefined),
                ...(learningStatus && status ? learningStatusesStyles[status] : learningStatusesStyles['unknown'])
            };
            const activeContainerStyles = isActive ? styles.containerStyle.active : undefined;
            
            // Special handling for furigana transcription
            if (transcription === 'furigana') {
                const { baseText, rubyText } = parseFuriganaToken(token.surface_form);

                // Use Japanese styles for base text, furigana styles for ruby text
                const baseTextStyle = japaneseStyles 
                    ? (isActive ? japaneseStyles.tokenStyles.active : japaneseStyles.tokenStyles.default)
                    : tokenStyle;

                const baseBackgroundStyle = japaneseStyles 
                    ? (isActive ? japaneseStyles.containerStyle.active : undefined)
                    : undefined;
                    
                const rubyTextStyle = {
                    ...tokenStyle,
                };
                
                return (
                    <div
                        key={`${token.id || tokenIdx}-${tokenIdx}`}
                        className='flex flex-col gap-1'
                        onClick={() => {
                            handleActivate(
                                cue.from,
                                cue.to,
                                {
                                    ...token,
                                    surface_form: baseText
                                },
                                'click'
                            );
                        }}
                        onMouseEnter={() => {
                            handleTokenMouseEnter(cue.id, token.id)
                            handleActivate(
                                cue.from,
                                cue.to,
                                {
                                    ...token,
                                    surface_form: baseText
                                },
                                'hover'
                            );
                        }}
                        onMouseLeave={() => { 
                            handleTokenMouseLeave()
                        }}
                    >
                        {/* Ruby text (furigana) - positioned above */}
                        {rubyText && (
                            <div
                                style={{
                                    ...activeContainerStyles,
                                    width: '100% !important'
                                }}
                            >
                                <span style={rubyTextStyle}>
                                    {rubyText}
                                </span>
                            </div>
                        )}
                        
                        {/* Base text (kanji/kana) - positioned below */}
                        <div
                            style={{
                                ...baseBackgroundStyle,
                                width: '100% !important'
                            }}
                            className='flex flex-row justify-center items-center text-center'
                        >
                            <span style={baseTextStyle}>
                                {baseText}
                            </span>
                        </div>
                    </div>
                );
            }
        
            // Regular rendering for other transcriptions
            return (
                <div
                    key={`${token.id || tokenIdx}-${tokenIdx}`}
                    style={{
                        ...(isActive ? activeContainerStyles : {}),
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
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(token.surface_form) }}
                    />
                </div>
            );
        });
    }, [
        styles,
        japaneseStyles, // Add this dependency
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
        cn(
            transcription === 'furigana' && 'flex flex-row items-end',
            transcription === 'english' && 'flex flex-row gap-1',
        ),
        [transcription]
    );
    
    // Get only the cues we need for this transcription
    const activeCues = activeSubtitles[transcription] || [];

    return (
        <div
            ref={setNodeRef}
            style={{
                ...styles.containerStyle.default,
                ...style,
            }}
            className={cn(containerClassName, "relative group")}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-background/80 rounded border"
            >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {activeCues.map((cue, idx) => (
                <Fragment key={`cue-${cue.id || idx}`}>
                    {renderTokens(cue)}
                </Fragment>
            ))}
        </div>
    );
});