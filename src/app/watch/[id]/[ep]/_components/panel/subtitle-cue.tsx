// In SubtitleCue.tsx
import { memo } from 'react';
import { cn } from "@/lib/utils";
import type { SubtitleCue as TSubtitleCue, SubtitleToken } from "@/types/subtitle";
import { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

type SubtitleCueProps = { 
    index: number;
    cue: TSubtitleCue
    isActive: boolean 
    style: CSSProperties,
    className?: string
    activeToken: SubtitleToken | null;
    handleSeek: (from: TSubtitleCue["from"]) => void
    handleClick: (sentance: string, token: SubtitleToken) => void
}

function SubtitleCueBase({ 
  isActive,
  style,
  cue,
  className = "",
  activeToken,
  handleSeek,
  handleClick,
}: SubtitleCueProps) {
    return (
        <div
            style={style}
            className={cn(
                "absolute top-0 left-0 w-full p-2 border-b",
                "flex items-center",
                isActive && "text-orange-400",
                className
            )}
        >
            <Button
                onClick={() => handleSeek(cue.from)}
                className="me-2"
                variant='ghost'
            >
                <Play className="hover:fill-[#fb923c]" />
            </Button>
            <div className="flex flex-col gap-2">
                <div className="flex items-center flex-wrap">
                    {cue.tokens?.length ? cue.tokens.map((token, idx) => (
                        <span 
                            key={idx}
                            className={cn(
                                "hover:text-orange-400",
                                activeToken?.id === token.id && "text-orange-400"
                            )}
                            onClick={() => handleClick(cue.content, token)}
                        >
                            {token.surface_form}
                        </span>
                    )) : null}
                </div>
            </div>
        </div>
    );
}

const SubtitleCue = memo(SubtitleCueBase, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.cue.id === nextProps.cue.id &&
    prevProps.activeToken?.id === nextProps.activeToken?.id &&
    prevProps.style === nextProps.style
  );
});

export default SubtitleCue;