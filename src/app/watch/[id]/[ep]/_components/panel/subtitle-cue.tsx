import { cn } from "@/lib/utils/utils";
import type { SubtitleCue as TSubtitleCue, SubtitleToken } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Clipboard, Play } from "lucide-react";
import DOMPurify from 'dompurify';
import { parseFuriganaToken } from '@/lib/utils/subtitle';
import { PitchLookup, WordsLookup } from "@/app/watch/[id]/[ep]/types";
import { WordSettings } from "@/lib/db/schema";
import { getPitchAccentType } from "@/lib/utils/pitch";
import { excludedPos, learningStatusesStyles } from "@/lib/constants/subtitle";
import { pitchAccentsStyles } from "@/lib/constants/pitch";
import { PitchAccents } from "@/types/pitch";

type SubtitleCueProps = { 
    index: number;
    cue: TSubtitleCue
    isActive: boolean 
    className?: string
    size: number;
    start: number;
    activeToken: SubtitleToken | null;
    pitchLookup: PitchLookup
    wordsLookup: WordsLookup
    learningStatus: WordSettings['learningStatus']
    pitchColoring: WordSettings['pitchColoring']
    handleSeek: (from: TSubtitleCue["from"]) => void
    handleClick: (token: SubtitleToken, from: number, to: number) => void
    handleCopy: (sentence: string) => void
}

function SubtitleCueBase({ 
  isActive,
  cue,
  className = "",
  size,
  start,
  activeToken,
  pitchLookup,
  wordsLookup,
  learningStatus,
  pitchColoring,
  handleSeek,
  handleClick,
  handleCopy,
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
                        // Check if this is furigana transcription
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

                        const style = {
                            ...(pitchColoring && accent ? pitchAccentsStyles[accent] : undefined),
                            ...(
                                learningStatus && !excludedPos.some(p => p == token.pos) && status 
                                    ? learningStatusesStyles[status] 
                                    : !excludedPos.some(p => p == token.pos) && learningStatusesStyles['unknown']
                            )
                        };

                        if (cue.transcription === 'furigana') {
                            const { baseText, rubyText } = parseFuriganaToken(token.surface_form);
                            
                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "cursor-pointer rounded transition-colors hover:bg-primary/10",
                                        activeToken?.id === token.id && "bg-primary/20"
                                    )}
                                    onClick={() => handleClick(
                                        {
                                            ...token,
                                            surface_form: baseText
                                        },
                                        cue.from,
                                        cue.to
                                    )}
                                    style={style}
                                >
                                    <div className='flex flex-col items-center'>
                                        {/* Ruby text (furigana) - positioned above */}
                                        {rubyText && (
                                            <div>
                                                <span>{rubyText}</span>
                                            </div>
                                        )}
                                        
                                        {/* Base text (kanji/kana) - positioned below */}
                                        <div>
                                            <span>{baseText}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        
                        // Regular rendering for other transcriptions
                        return (
                            <span
                                key={idx}
                                className={cn(
                                    "cursor-pointer rounded transition-colors hover:bg-primary/10",
                                    activeToken?.id === token.id && "bg-primary/20"
                                )}
                                onClick={() => handleClick(token, cue.from, cue.to)}
                                style={style}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(token.surface_form) }}
                            />
                        );
                    }) : null}
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