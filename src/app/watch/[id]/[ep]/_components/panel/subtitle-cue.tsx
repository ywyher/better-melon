import { memo } from 'react';
import { cn } from "@/lib/utils";
import type { SubtitleCue as TSubtitleCue, SubtitleToken } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

type SubtitleCueProps = { 
    index: number;
    cue: TSubtitleCue
    isActive: boolean 
    className?: string
    size: number;
    start: number;
    activeToken: SubtitleToken | null;
    handleSeek: (from: TSubtitleCue["from"]) => void
    handleClick: (sentance: string, token: SubtitleToken) => void
}

function SubtitleCueBase({ 
  isActive,
  cue,
  className = "",
  size,
  start,
  activeToken,
  handleSeek,
  handleClick,
}: SubtitleCueProps) {
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

// memo doesnt really work here because the user would have to scroll from the current viewport for the list to update the current viewport
// and the only solution found till now is to scroll the the bottom the back where we were again but it feels a bit sluggish compared to without it
const SubtitleCue = SubtitleCueBase

// const SubtitleCue = memo(SubtitleCueBase, (prevProps, nextProps) => {
//   return (
//     prevProps.isActive === nextProps.isActive &&
//     prevProps.cue.id === nextProps.cue.id &&
//     prevProps.activeToken?.id === nextProps.activeToken?.id &&
//     prevProps.start === nextProps.start
//   );
// });

export default SubtitleCue;