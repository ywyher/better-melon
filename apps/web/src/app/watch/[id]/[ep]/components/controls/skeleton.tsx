import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ControlsSkeleton() {
  return (
    <Card className="flex flex-col gap-10 p-5 py-4 bg-secondary">
      <div className="flex flex-col gap-5">
        {/* Transcription and Screenshot Section */}
        <div className="flex flex-col-reverse gap-3">
          <div className="flex flex-row gap-2">
            {/* EnabledTranscriptions skeleton */}
            <div className="w-full flex-1">
              <Skeleton className="h-10 w-full rounded-md bg-background" />
            </div>
            {/* Screenshot button skeleton */}
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          
          {/* SettingsToggles skeleton */}
          <div className="flex flex-row gap-1 flex-wrap justify-between">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton 
                key={index} 
                className="h-9 w-40 px-4 rounded-md"
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Navigation Section */}
        <div className="flex flex-row gap-2 w-full justify-between items-center">
          {/* Cue Navigations */}
          <div className="flex flex-col gap-2 w-full flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          
          <Separator orientation="vertical" />
          
          {/* Episode Navigations */}
          <div className="flex flex-col gap-2 w-full flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
}