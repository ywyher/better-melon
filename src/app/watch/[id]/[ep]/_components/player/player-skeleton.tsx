import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerSkeleton({ isLoading }: { isLoading: boolean }) {
    return (
        <>
            {isLoading && (
                <div className="
                    absolute inset-0 z-10
                    flex flex-col
                    w-full h-fit 
                ">
                    <div className="w-full aspect-video bg-gray-800 relative overflow-hidden">
                        {/* Main video area skeleton */}
                        <Skeleton className="w-full h-fit animate-pulse" />
                        
                        {/* Loading text overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-white text-sm font-medium">Loading video...</p>
                            </div>
                        </div>
                        
                        {/* Timeline skeleton */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-black bg-opacity-50 px-4 flex items-center">
                            <Skeleton className="h-1 w-full rounded-full" />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}