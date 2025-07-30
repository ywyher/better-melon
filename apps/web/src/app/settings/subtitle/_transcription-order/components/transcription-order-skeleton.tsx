import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TranscriptionOrderSkeleton() {
    return (
        <div className='flex flex-col gap-3 h-[50vh]'>
            <Skeleton className="w-[350px] h-10" />
            <Card className="relative flex justify-end h-full pt-0 mt-0 overflow-hidden">
                <div className="absolute inset-0 " />
                
                <CardHeader className="z-10"><CardTitle></CardTitle></CardHeader>
                <CardContent className="flex flex-col justify-center items-center gap-2 z-10 w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-full flex items-center">
                            <Skeleton className="h-12 w-full rounded-md" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}