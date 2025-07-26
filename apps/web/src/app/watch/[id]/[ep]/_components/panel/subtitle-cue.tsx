import React from 'react';
import { cn } from "@/lib/utils/utils";
import type { SubtitleCue as TSubtitleCue } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Clipboard, Play } from "lucide-react";
import { useSubtitleCue } from '@/lib/hooks/use-subtitle-cue';
import { CueToken } from '@/components/token/cue-token';

type SubtitleCueProps = { 
  index: number;
  cue: TSubtitleCue;
  japaneseCue?: TSubtitleCue;
  isActive: boolean;
  className?: string;
  size: number;
  start: number;
}

function SubtitleCueBase({ 
  isActive,
  cue,
  japaneseCue,
  className = "",
  size,
  start,
}: SubtitleCueProps) {
  const { activeToken, handleSeek, handleTokenClick, handleCopy, getTokenAccent, showFurigana } = useSubtitleCue();

  return (
    <div 
      style={{
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
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
      <div className="flex flex-col gap-0">
        <div className="flex flex-wrap gap-1 items-end">
          {cue.tokens?.length ? cue.tokens.map((token, idx) => {
            const accent = getTokenAccent(token) 
            const japaneseToken = japaneseCue?.tokens?.find((t) => t.id == token.id)

            return (
                <CueToken
                    key={idx}
                    showFurigana={showFurigana}
                    accent={accent}
                    token={token}
                    index={idx}
                    transcription={cue.transcription}
                    isActive={activeToken?.id === token.id}
                    onTokenClick={() => handleTokenClick(japaneseToken || token, cue.from, cue.to)}
                />
            )
          }) : null}        
        </div>
      </div>
    </div>
  );
}

const SubtitleCue = SubtitleCueBase;

export default SubtitleCue;