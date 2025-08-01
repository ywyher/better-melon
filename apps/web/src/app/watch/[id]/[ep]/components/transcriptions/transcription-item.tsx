"use client"

import React, { Fragment, useMemo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SubtitleToken, SubtitleTranscription } from '@/types/subtitle';
import { cn } from '@/lib/utils/utils';
import { Subtitle } from '@/app/watch/[id]/[ep]/types';
import { GripVertical } from 'lucide-react';
import { useTranscriptionItem } from '@/lib/hooks/use-transcription-item';
import TokenRenderer from '@/components/token/token-renderer';
import { useSubtitleStylesStore } from '@/lib/stores/subtitle-styles-store';

type TranscriptionItemProps = {
  transcription: SubtitleTranscription;
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

  const computedStyles = useSubtitleStylesStore((state) => state.computedStyles)

  const memoizedData = useMemo(() => {
    const activeCues = activeSubtitles?.[transcription] || [];
    
    const sortableStyles = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const containerStyles = {
      ...(computedStyles?.[transcription]?.container.default || computedStyles?.["all"]?.container.default),
      ...sortableStyles,
    };

    const containerClassName = cn(
      TRANSCRIPTION_CLASSES[transcription as keyof typeof TRANSCRIPTION_CLASSES],
      "relative group"
    );

    return {
      activeCues,
      containerStyles,
      containerClassName,
    };
  }, [activeSubtitles, transcription, transform, transition, computedStyles]);

  const { activeCues, containerStyles, containerClassName } = memoizedData;

  const memoizedTokens = useMemo(() => {
    const activeCues = activeSubtitles?.[transcription] || [];
      return activeCues.map(cue => ({
        cue,
        tokens: cue.tokens?.map((token, tokenIdx) => ({
          ...token,
          key: `${token.id}-${tokenIdx}`,
          japaneseToken: activeSubtitles?.['japanese']?.[0]?.tokens?.find((t) => t.id === token.id)
      })) || []
    }));
  }, [activeSubtitles, transcription]);

  const handleTokenClick = useCallback((cueId: number, token: SubtitleToken) => {
    console.log({
      cueId, 
      token
    })
    const cue = activeCues.find(c => c.id === cueId);
    if (cue) {
      handleActivate(cue.from, cue.to, token, 'click');
    }
  }, [activeCues, handleActivate]);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...containerStyles,
      }}
      className={containerClassName}
    >
      <div
        {...attributes}
        {...listeners}
        className={DRAG_HANDLE_CLASSES}
      >
        <GripVertical className={GRIP_CLASSES} />
      </div>
      {memoizedTokens.map(({ cue, tokens }) => (
        <Fragment key={`${transcription}-${cue.id}`}>
          {tokens.map((token) => (
            <TokenRenderer
              key={token.key}
              cue={cue}
              token={token}
              transcription={transcription}
              onTokenClick={handleTokenClick}
              onTokenMouseEnter={handleTokenMouseEnter}
              onTokenMouseLeave={handleTokenMouseLeave}
              isTokenActive={isTokenActive}
              getTokenAccent={getTokenAccent}
              japaneseToken={token.japaneseToken}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
});

export default TranscriptionItem;