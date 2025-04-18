'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubtitleCue, SubtitleToken } from "@/types/subtitle";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";
import { useWatchStore } from "@/app/watch/[id]/[ep]/store";
import { Button } from "@/components/ui/button";
import { srtTimestampToSeconds } from "@/lib/funcs";
import { Play } from "lucide-react";
import { useDefinitionStore } from "@/lib/stores/definition-store";

type SubtitleCueProps = { 
    index: number;
    cue: SubtitleCue, 
    isActive: boolean 
    style: CSSProperties,
    className?: string
}

export default function SubtitleCue({ 
    cue,
    isActive,
    style,
    className = "",
}: SubtitleCueProps) {
    const { from, tokens, content } = cue;
    const player = useWatchStore((state) => state.player)
    const delay = useWatchStore((state) => state.delay)

    const activeToken = useDefinitionStore((state) => state.token)
    const setSentance = useDefinitionStore((state) => state.setSentance)
    const setToken = useDefinitionStore((state) => state.setToken)
      
    const handleSeek = () => {
        player.current?.remoteControl.seek(srtTimestampToSeconds(from) + delay.japanese)  
    };

    const handleClick = (sentance: string, token: SubtitleToken) => {
        if(!sentance || !token) return;
        setSentance(sentance)
        setToken(token)
    }
    
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
                onClick={(() => handleSeek())}
                className="me-2"
                variant='ghost'
            >
                <Play className="hover:fill-[#fb923c]" />
            </Button>
            <div className="flex flex-col gap-2">
                {/* <div className="flex flex-row gap-3">
                    <p>{from} -</p>
                    <p> {to}</p>
                </div> */}
                <div className="flex items-center flex-wrap">
                    {tokens?.length && tokens?.map((token, idx) => {
                        return (
                            <span 
                                key={idx}
                                className={cn(
                                    "hover:text-orange-400",
                                    activeToken?.id == token.id && "text-orange-400"
                                )}
                                onClick={() => {
                                    handleClick(content, token)
                                }}
                            >
                                {token.surface_form}
                            </span>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export function SubtitleCueSkeleton() {
    return(
        <Card className="mb-4">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="text-sm text-muted-foreground space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
                <Separator />
                <Skeleton className="h-5 w-24" />
                <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-6 w-12 rounded-md" />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}