// AnimeError.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AnimeErrorProps } from "@/app/info/[id]/types"

export function AnimeError({ error }: AnimeErrorProps) {
    const router = useRouter()
    
    return (
        <Card className="w-full max-w-4xl mx-auto my-8 border-red-300">
            <CardContent className="pt-6">
                <div className="flex items-center justify-center p-8 text-center">
                    <div>
                        <h3 className="text-xl font-semibold text-red-500 mb-2">Error loading anime data</h3>
                        <p className="text-muted-foreground mb-4">{error.message || "Please try again later"}</p>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Return to Home
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}