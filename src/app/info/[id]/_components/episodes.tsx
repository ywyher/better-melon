import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Anime } from "@/types/anime"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type AnimeEpisodesProps = {
    episodes: Anime['episodes']
    nextAiringEpisode: Anime['nextAiringEpisode']
    id: Anime['id']
    router: AppRouterInstance
}

export function AnimeEpisodes({ episodes, nextAiringEpisode, id, router }: AnimeEpisodesProps) {
    const episodesArray = Array.from({ length: episodes || 0 }, (_, i) => i + 1)
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Episodes</CardTitle>
            </CardHeader>
            <CardContent>
                {episodesArray.length > 0 ? (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {episodesArray.filter(ep => {
                            if(nextAiringEpisode) {
                                return ep < nextAiringEpisode.episode
                            }else {
                                return ep
                            }
                        }).map((episode) => (
                            <Button 
                                key={episode} 
                                variant="outline"
                                className="w-full aspect-square flex items-center justify-center text-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => router.push(`/watch/${id}/${episode}`)}
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