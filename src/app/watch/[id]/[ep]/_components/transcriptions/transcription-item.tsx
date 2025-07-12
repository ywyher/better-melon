"use client"

import React, { Fragment, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils/utils';
import { Subtitle, TranscriptionStyleSet } from '@/app/watch/[id]/[ep]/types';
import { GripVertical } from 'lucide-react';
import { useTranscriptionItem } from '@/lib/hooks/use-transcription-item';
import TokenRenderer from '@/components/token/token-renderer';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
  furiganaStyles: TranscriptionStyleSet;
  styles: TranscriptionStyleSet;
  activeSubtitles: Subtitle;
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

  const sortableStyles = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);

  const {
    handleTokenMouseEnter,
    handleTokenMouseLeave,
    handleActivate,
    getTokenAccent,
    isTokenActive,
  } = useTranscriptionItem(transcription);

  const handleTokenClick = (cueId: number, token: SubtitleToken) => {
    const cue = activeCues.find(c => c.id === cueId);
    if (cue) {
      handleActivate(cue.from, cue.to, token, 'click');
    }
  };

  const containerClassName = useMemo(() => 
    cn(
      transcription === 'japanese' && 'flex flex-row items-end',
      transcription === 'english' && 'flex flex-row gap-1',
    ),
    [transcription]
  );
  
  const activeCues = useMemo(() => {
    return activeSubtitles?.[transcription] || [];
  }, [activeSubtitles, transcription]);

  const japaneseTokens = useMemo(() => {
    return activeSubtitles?.['japanese']?.[0]?.tokens || [];
  }, [activeSubtitles]);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.containerStyle.default,
        ...sortableStyles,
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
          <TokenRenderer
            cue={cue}
            transcription={transcription}
            styles={styles}
            furiganaStyles={furiganaStyles}
            onTokenClick={handleTokenClick}
            onTokenMouseEnter={handleTokenMouseEnter}
            onTokenMouseLeave={handleTokenMouseLeave}
            isTokenActive={isTokenActive}
            getTokenAccent={getTokenAccent}
            japaneseTokens={japaneseTokens}
          />
        </Fragment>
      ))}
    </div>
  );
});