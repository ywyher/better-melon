import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WordCardSkeleton() {
  return (
    <Card className="relative flex flex-row justify-between overflow-hidden min-h-[90px] border-0">
      {/* Background skeleton for image area */}
      <div className="absolute top-0 right-0 bottom-0 w-3/4">
        <Skeleton className="w-full h-full" />
        {/* Gradient overlay skeleton */}
        <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-transparent to-background opacity-50" />
      </div>
      
      {/* Content skeleton */}
      <CardHeader className="relative z-10 flex-1">
        <CardTitle className="text-xl font-semibold">
          {/* Word skeleton */}
          <Skeleton className="h-7 w-24" />
        </CardTitle>
        <CardDescription className="flex flex-row items-center gap-2">
          {/* Anime title skeleton */}
          <Skeleton className="h-4 w-32" />
          {/* Dot separator */}
          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
          {/* Status skeleton */}
          <Skeleton className="h-4 w-16" />
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 flex items-center p-4">
        {/* Right side content skeleton (if needed for future content) */}
        <div className="text-right">
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}