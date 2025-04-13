import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnkiSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
            <CardTitle className="flex justify-between items-center">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-9 w-44" />
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32" />
                </div>
            </div>
            </CardContent>
        </Card>
    )
}