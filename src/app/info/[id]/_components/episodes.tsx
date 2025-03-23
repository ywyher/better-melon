// AnimeEpisodes.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimeEpisodesProps } from "@/app/info/[id]/types"

export function AnimeEpisodes({ episodes, animeId, router }: AnimeEpisodesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Episodes</CardTitle>
            </CardHeader>
            <CardContent>
                {episodes.length > 0 ? (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {episodes.map((episode) => (
                            <Button 
                                key={episode} 
                                variant="outline"
                                className="w-full aspect-square flex items-center justify-center text-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => router.push(`/subs/${animeId}/${episode}`)}
                            >
                                {episode}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No episodes available</p>
                )}
            </CardContent>
        </Card>
    )
}