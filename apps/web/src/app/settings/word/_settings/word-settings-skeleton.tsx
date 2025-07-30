import { Skeleton } from "@/components/ui/skeleton";

export function WordSettingsSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2">
                <div className="col-span-1 space-y-2">
                    <Skeleton className="h-5 w-32" /> {/* Title */}
                    <Skeleton className="h-4 w-64" /> {/* Description */}
                </div>
                <div className="col-span-1 flex justify-end">
                    <Skeleton className="h-6 w-11 rounded-full mt-2 md:mt-0" /> {/* Switch */}
                </div>
            </div>
            <div className="flex flex-col md:grid grid-cols-2 md:items-center justify-between gap-2">
                <div className="col-span-1 space-y-2">
                    <Skeleton className="h-5 w-32" /> {/* Title */}
                    <Skeleton className="h-4 w-64" /> {/* Description */}
                </div>
                <div className="col-span-1 flex justify-end">
                    <Skeleton className="h-6 w-11 rounded-full mt-2 md:mt-0" /> {/* Switch */}
                </div>
            </div>
        </div>
    );
}