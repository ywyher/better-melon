import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SubtitleStylesSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <Card className="w-full border-none pt-0 shadow-md">
        <CardHeader>
          <CardTitle className="m-0 p-0"></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-0">
          {/* Font Settings Section Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-1 rounded-full"></Skeleton>
              <Skeleton className="h-7 w-32" />
            </div>
            <div className="pl-3 pr-1 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="w-full">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-2" />
          
          {/* Text Appearance Section Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-1 rounded-full"></Skeleton>
              <Skeleton className="h-7 w-40" />
            </div>
            <div className="pl-3 pr-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-28 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Background Style Section Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-1 rounded-full"></Skeleton>
              <Skeleton className="h-7 w-44" />
            </div>
            <div className="pl-3 pr-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-5 w-36 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-0 mt-4">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>
  )
}