// AnimeDataSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AnimeDataSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6">
            {/* Back Button Skeleton */}
            <div className="mb-4">
                <Skeleton className="h-9 w-20" />
            </div>
            
            {/* Banner Skeleton */}
            <Skeleton className="w-full h-48 md:h-64 lg:h-80 mb-6 rounded-lg" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover Image Skeleton */}
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="pt-6">
                            <Skeleton className="w-full aspect-[2/3] rounded-lg mb-4" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Title and Description Skeleton */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                {Array.from({ length: 20 }, (_, i) => (
                                    <Skeleton key={i} className="w-full aspect-square rounded" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="mt-6">
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-8 w-24 mt-2" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}