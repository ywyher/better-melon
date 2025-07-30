"use client"

import React, { Fragment, useMemo, useCallback } from 'react';
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

const TRANSCRIPTION_CLASSES = {
  japanese: 'flex flex-row items-end',
  english: 'flex flex-row gap-1',
} as const;

const DRAG_HANDLE_CLASSES = "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-background/80 rounded border";
const GRIP_CLASSES = "w-4 h-4 text-muted-foreground";

export const TranscriptionItem = React.memo<TranscriptionItemProps>(function TranscriptionItemOptimized({ 
  transcription,
  furiganaStyles,
  styles,
  activeSubtitles
}) {
  const sortableConfig = useMemo(() => ({
    id: transcription,
    disabled: false
  }), [transcription]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable(sortableConfig);

  const {
    handleTokenMouseEnter,
    handleTokenMouseLeave,
    handleActivate,
    getTokenAccent,
    isTokenActive,
  } = useTranscriptionItem(transcription);

  const memoizedData = useMemo(() => {
    const activeCues = activeSubtitles?.[transcription] || [];
    const japaneseTokens = activeSubtitles?.['japanese']?.[0]?.tokens || [];
    
    const sortableStyles = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const containerStyles = {
      ...styles.containerStyle.default,
      ...sortableStyles,
    };

    const containerClassName = cn(
      TRANSCRIPTION_CLASSES[transcription as keyof typeof TRANSCRIPTION_CLASSES],
      "relative group"
    );

    return {
      activeCues,
      japaneseTokens,
      containerStyles,
      containerClassName,
    };
  }, [activeSubtitles, transcription, transform, transition, styles.containerStyle.default]);

  const { activeCues, japaneseTokens, containerStyles, containerClassName } = memoizedData;

  const handleTokenClick = useCallback((cueId: number, token: SubtitleToken) => {
    const cue = activeCues.find(c => c.id === cueId);
    if (cue) {
      handleActivate(cue.from, cue.to, token, 'click');
    }
  }, [activeCues, handleActivate]);

  return (
    <div
      ref={setNodeRef}
      style={containerStyles}
      className={containerClassName}
    >
      <div
        {...attributes}
        {...listeners}
        className={DRAG_HANDLE_CLASSES}
      >
        <GripVertical className={GRIP_CLASSES} />
      </div>
      {activeCues.map((cue, idx) => (
        <Fragment key={`${transcription}-${cue.id || idx}`}>
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

export default TranscriptionItem;