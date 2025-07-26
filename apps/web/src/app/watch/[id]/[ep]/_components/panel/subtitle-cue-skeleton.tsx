import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@radix-ui/react-select';

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