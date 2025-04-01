import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubtitleCue } from "@/types/subtitle";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function SubtitleCue({ cue, isActive }: { cue: SubtitleCue, isActive: boolean }) {
    const { id, from, to, content, tokens } = cue;

    return (
        <Card key={id} className="mb-4 p-0">
            <CardContent className={cn(
                "p-4 space-y-3",
                isActive && "bg-orange-400 text-white"
            )}>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-medium">{content}</p>
                    <div className="text-sm text-muted-foreground">
                        <p>{from}</p>
                        <p>{to}</p>
                    </div>
                </div>

                {tokens && tokens.length > 0 && (
                    <div className="space-y-2">
                        <Separator />
                        <p className="text-sm font-semibold">Tokenized:</p>
                        <div className="flex flex-wrap gap-2">
                            {tokens.map((token, index) => (
                                <Badge key={index} variant="outline" title={`${token.pos}: ${token.basic_form}`}>
                                    {token.surface_form}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
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