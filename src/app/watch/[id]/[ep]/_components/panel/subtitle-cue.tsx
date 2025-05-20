import { memo } from 'react';
import { cn } from "@/lib/utils";
import type { SubtitleCue as TSubtitleCue, SubtitleToken } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Clipboard, Play } from "lucide-react";

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
    handleCopy: (sentance: string) => void
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
  handleCopy
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
                "absolute top-0 left-0 w-full py-2 pe-1 border-b",
                "flex items-center",
                isActive && "text-orange-400",
                className
            )}
        >
            <div className="flex flex-row gap-0">
                <Button
                    onClick={() => handleSeek(cue.from)}
                    variant='ghost'
                >
                    <Play className="hover:fill-[#fb923c]" />
                </Button>
                <Button
                    onClick={() => handleCopy(cue.content)}
                    variant='ghost'
                >
                    <Clipboard className="hover:fill-[#fb923c]" />
                </Button>
            </div>
            <div className="flex flex-row gap-2">
                <div className="flex items-center flex-wrap">
                    {cue.tokens?.length ? cue.tokens.map((token, idx) => (
                        <span 
                            key={idx}
                            className={cn(
                                "hover:text-orange-400",
                                activeToken?.id === token.id && "text-orange-400"
                            )}
                            // onClick={() => handleClick(cue.content, token)}
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