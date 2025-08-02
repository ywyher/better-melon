import React, { useMemo } from 'react';
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Clipboard, Play } from "lucide-react";
import { useSubtitleCue } from '@/lib/hooks/use-subtitle-cue';
import { CueToken } from '@/components/token/cue-token';
import type { SubtitleCue as TSubtitleCue } from "@/types/subtitle";

type SubtitleCueProps = { 
  index: number;
  cue: TSubtitleCue;
  japaneseCue?: TSubtitleCue;
  isActive: boolean;
  className?: string;
  size: number;
  start: number;
}

const SubtitleCue = React.memo(({ 
  isActive,
  cue,
  japaneseCue,
  className = "",
  size,
  start,
}: SubtitleCueProps) => {
  const { activeToken, handleSeek, handleTokenClick, handleCopy, getTokenAccent, showFurigana } = useSubtitleCue();

  // Memoize the style object
  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: `${size}px`,
    transform: `translateY(${start}px)`,
  }), [size, start]);
  
  return (
    <div 
      style={containerStyle}
      className={cn(
        "group flex cursor-pointer items-center border-l-2 border-b-2 border-b-primary border-l-transparent transition-all hover:bg-muted/50",
        isActive && "border-l-primary bg-muted",
        className
      )}
    >
      <div className="flex items-center gap-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="sm"
          onClick={() => handleSeek(cue.from)}
          variant='ghost'
        >
          <Play className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={() => handleCopy(cue.content)}
          variant='ghost'
        >
          <Clipboard className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-y-3 gap-1 flex-row items-end">
        {cue.tokens?.length ? cue.tokens.map((token, idx) => {
          const accent = getTokenAccent(token) 
          const japaneseToken = japaneseCue?.tokens?.find((t) => t.id == token.id)

          return (
            <CueToken
              key={idx}
              showFurigana={showFurigana}
              accent={accent}
              token={token}
              transcription={cue.transcription}
              isActive={activeToken?.id === token.id}
              onTokenClick={() => handleTokenClick(japaneseToken || token, cue.from, cue.to)}
            />
          )
        }) : null}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.cue.id === nextProps.cue.id &&
    prevProps.size === nextProps.size &&
    prevProps.start === nextProps.start &&
    prevProps.japaneseCue?.id === nextProps.japaneseCue?.id &&
    // compare the actual cue content/tokens which change with transcription
    JSON.stringify(prevProps.cue.tokens) === JSON.stringify(nextProps.cue.tokens)
  );
});

export default SubtitleCue;