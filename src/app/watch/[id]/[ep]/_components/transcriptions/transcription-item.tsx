"use client"

import React, { Fragment, useCallback, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDefinitionStore } from '@/lib/stores/definition-store';
import { SubtitleCue, SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils/utils';
import { Subtitle, TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { SubtitleSettings } from '@/lib/db/schema';
import { getSentencesForCue, isTokenExcluded, parseFuriganaToken } from '@/lib/utils/subtitle';
import { useDelayStore } from '@/lib/stores/delay-store';
import DOMPurify from 'dompurify';
import { GripVertical } from 'lucide-react';
import { getPitchAccentType } from '@/lib/utils/pitch';
import { pitchAccentsStyles } from '@/lib/constants/pitch';
import { PitchAccents } from '@/types/pitch';
import { excludedPos, learningStatusesStyles } from '@/lib/constants/subtitle';
import { useWatchDataStore } from '@/lib/stores/watch-store';
import { RubyText } from '@/components/ruby-text';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  furiganaStyles: TranscriptionStyleSet;
  styles: TranscriptionStyleSet;
  activeSubtitles: Subtitle
}

export const TranscriptionItem = React.memo(function TranscriptionItem({ 
    transcription,
    furiganaStyles,
    styles,
    activeSubtitles
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
    const setFurigana = useDefinitionStore((state) => state.setFurigana)

    const furigana = useWatchDataStore((state) => state.settings.subtitleSettings.furigana)
    const learningStatus = useWatchDataStore((state) => state.settings.wordSettings.learningStatus)
    const pitchColoring = useWatchDataStore((state) => state.settings.wordSettings.pitchColoring)
    const definitionTrigger = useWatchDataStore((state) => state.settings.subtitleSettings.definitionTrigger)
    const pitchLookup = useWatchDataStore((state) => state.pitchLookup)
    const wordsLookup = useWatchDataStore((state) => state.wordsLookup)
    const transcriptionsLookup = useWatchDataStore((state) => state.transcriptionsLookup)
    
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

    const handleActivate = useCallback(async (from: number, to: number, token: SubtitleToken, furigana: string, trigger: SubtitleSettings['definitionTrigger']) => {
        if (
            !from
            || !to
            || !token 
            || transcription == 'english' 
            || definitionTrigger != trigger
            || isTokenExcluded(token)
        ) return;

        const pitch = pitchLookup.get(token.original_form)
        let accent;
        if (pitch) {
            accent = getPitchAccentType({
                position: pitch?.pitches[0].position,
                reading: token.original_form
            })
        }

        await navigator.clipboard.writeText(token.surface_form);

        if (storeToken && storeToken.id === token.id) {
            // If clicking on the same token, clear it
            setToken(null);
            setFurigana(furigana)
            setSentences({
                kanji: null,
                kana: null,
                english: null,
            });
        } else {
            // Otherwise set the new token and sentence
            setToken(token);
            setFurigana(furigana)
            const sentences = getSentencesForCue(transcriptionsLookup, from, to, delay);
            setSentences(sentences);
        }
    }, [storeToken, storeSentences, setToken, setSentences]);
  

    const renderTokens = useCallback((cue: SubtitleCue) => {
        if (!cue.tokens?.length) {
            return <span style={styles.tokenStyles.default}>{cue.content}</span>;
        }

        
        return cue.tokens.map((token, tokenIdx) => {
            const japaneseToken: SubtitleToken | undefined = activeSubtitles?.['japanese']?.[0]?.tokens?.find((t) => t.id == token.id)
            const { baseText, rubyText } = parseFuriganaToken(japaneseToken?.surface_form || token.surface_form);

            const pitch = pitchLookup.get(token.original_form)
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
                ...(
                    learningStatus && cue.transcription != 'english' && !excludedPos.some(p => p == token.pos) && status 
                        ? learningStatusesStyles[status] 
                        : !excludedPos.some(p => p == token.pos) && cue.transcription != 'english' && learningStatusesStyles['unknown']
                )
            };
            const activeContainerStyles = isActive ? styles.containerStyle.active : undefined;
            
            // Special handling for japanese since it has furigana
            if (transcription === 'japanese') {
                // Use Japanese styles for base text, furigana styles for ruby text
                const baseTextStyle = tokenStyle
                const baseBackgroundStyle = (isActive ? activeContainerStyles : {
                    display: 'flex'
                })
                const rubyTextStyle = {
                    ...(isActive ? furiganaStyles.tokenStyles.active : furiganaStyles.tokenStyles.default),
                }

                return (
                    <RubyText
                        key={`${token.id || tokenIdx}-${tokenIdx}`}
                        baseText={baseText}
                        rubyText={rubyText || ""}
                        showFurigana={furigana}
                        baseTextStyle={baseTextStyle}
                        rubyTextStyle={rubyTextStyle}
                        baseBackgroundStyle={baseBackgroundStyle}
                        // className={className}
                        style={style}
                        onClick={() => {
                            handleActivate(
                                cue.from,
                                cue.to,
                                { ...token, surface_form: baseText },
                                rubyText || "",
                                'click'
                            );
                        }}
                        onMouseEnter={() => {
                            handleTokenMouseEnter(cue.id, token.id);
                            handleActivate(
                                cue.from,
                                cue.to,
                                { ...token, surface_form: baseText },
                                rubyText || "",
                                'hover'
                            );
                        }}
                        onMouseLeave={() => {
                            handleTokenMouseLeave();
                        }}
                    />
                )
            }
        
            // Regular rendering for other transcriptions
            return (
                <div
                    key={`${token.id || tokenIdx}-${tokenIdx}`}
                    style={{
                        ...(isActive ? activeContainerStyles : {
                            display: 'flex'
                        }),
                    }}
                >
                    <span
                        style={tokenStyle}
                        onClick={() => {
                            handleActivate(
                                cue.from,
                                cue.to,
                                token,
                                rubyText || "",
                                'click'
                            );
                        }}
                        onMouseEnter={() => {
                            handleTokenMouseEnter(cue.id, token.id)
                            handleActivate(
                                cue.from,
                                cue.to,
                                token,
                                rubyText || "",
                                'hover'
                            );
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
        furiganaStyles,
        furigana,
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
            transcription === 'japanese' && 'flex flex-row items-end',
            transcription === 'english' && 'flex flex-row gap-1',
        ),
        [transcription]
    );
    
    // Get only the cues we need for this transcription
    const activeCues = useMemo(() => {
        return activeSubtitles?.[transcription] || []
    }, [activeSubtitles, transcription]);

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