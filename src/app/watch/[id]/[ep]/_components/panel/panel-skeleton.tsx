"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { useId } from "react";

export default function PanelSkeleton() {
  const id = useId();
  
  return (
    <Card className="flex flex-col gap-3 w-full max-w-[500px]">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-row justify-between items-center w-full">
          <CardTitle className="text-xl">Dialogue</CardTitle>
          <div className="flex flex-row gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <Tabs defaultValue="japanese" className="w-full">
          <TabsList className="w-full space-x-5">
            {[1,2,3,4].map((_, index) => (
              <Skeleton key={`${id}-tab-${index}`} className="w-full" />
            ))}
          </TabsList>
          <TabsContent value="japanese" className="relative w-full">
            <div className="overflow-auto h-[80vh] w-full">
              {/* Virtual list of cue skeletons with predetermined widths */}
              {Array(20).fill(0).map((_, index) => (
                <SubtitleCueSkeleton key={`${id}-cue-${index}`} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

function SubtitleCueSkeleton({ index }: { index: number }) {
  // Predefined set of widths to ensure consistency between server and client
  const tokenWidths = [
    [25, 32, 45, 22, 36, 28, 30, 40],  // Pattern 1
    [30, 22, 38, 45, 28, 33, 24, 35],  // Pattern 2
    [28, 40, 22, 35, 26, 38, 30, 42],  // Pattern 3
    [35, 26, 42, 30, 24, 38, 45, 28]   // Pattern 4
  ];
  
  // Use modulo to pick a pattern based on index
  const widthPattern = tokenWidths[index % tokenWidths.length];
  
  return (
    <div className="p-2 border-b flex items-center">
      <Skeleton className="h-9 w-10 me-2" /> {/* Play button skeleton */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center flex-wrap">
          {/* Use predetermined widths from pattern */}
          {widthPattern.map((width, idx) => (
            <Skeleton
              key={`token-${idx}`}
              className="h-7 mr-1 mb-1"
              style={{ width: `${width}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}