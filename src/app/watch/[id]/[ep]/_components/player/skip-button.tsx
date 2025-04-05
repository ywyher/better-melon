import { Button } from "@/components/ui/button";
import { SkipTime } from "@/types/anime";
import { Dispatch, SetStateAction } from "react";

export default function SkipButton({ 
    canSkip,
    setCanSkip,
    skipTimes,
    currentTime
}: { 
    canSkip: boolean;
    setCanSkip: Dispatch<SetStateAction<boolean>>
    skipTimes: SkipTime[];
    currentTime: number
}) {
    return (
        <>
            {canSkip && (
                <Button
                    className="
                        absolute z-10
                        bottom-20 right-4
                    "
                    variant='secondary'
                    onClick={(() => {
                        if(!currentTime) return;
                        const skipInterval = skipTimes.find(
                            ({ interval }) =>
                            currentTime >= interval.startTime && currentTime < interval.endTime,
                        );
                        if (skipInterval) {
                            currentTime = skipInterval.interval.endTime;
                            setCanSkip(false)
                        }
                    })}
                >
                    <span>Skip</span>
                    {skipTimes.length && (
                        <>
                            {
                                (() => {
                                    if(!currentTime) return;
                                    const matchedInterval = skipTimes.find(({ interval }) => 
                                        (currentTime || 0) >= interval.startTime &&
                                        (currentTime || 0) < interval.endTime
                                    );
                                
                                    return matchedInterval?.skipType == 'OP' ? "Opening" : "Outro";
                                })()
                            }
                        </>
                    )}
                </Button>    
            )}
        </>
    )
}