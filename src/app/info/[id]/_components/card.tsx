import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Anime } from "@/types/anime"

type AnimeCardProps = {
    coverImage: Anime['coverImage'] 
    title: Anime['title']
    format: Anime['format'] 
    status: Anime['status'] 
    season: Anime['season'] 
    seasonYear: Anime['seasonYear'] 
    genres: Anime['genres']
}

export function AnimeCard({ 
    coverImage, 
    title, 
    format, 
    status, 
    season, 
    seasonYear, 
    genres 
}: AnimeCardProps) {
    return (
        <Card>
            <CardContent>
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-4">
                    {coverImage ? (
                        <Image 
                            src={coverImage.large} 
                            alt={title.english || ""}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
                
                <div className="space-y-2">
                    {format && (
                        <Badge variant="outline" className="mr-2">
                            {format}
                        </Badge>
                    )}
                    {status && (
                        <Badge variant="outline" className="mr-2">
                            {status}
                        </Badge>
                    )}
                    {season && seasonYear && (
                        <Badge variant="outline">
                            {season} {seasonYear}
                        </Badge>
                    )}
                </div>
                
                <div className="mt-4">
                    {genres && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {genres.map((genre: string) => (
                                <Badge key={genre} variant="secondary">
                                    {genre}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}