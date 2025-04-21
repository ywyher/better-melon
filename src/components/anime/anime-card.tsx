import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Anime } from "@/types/anime";
import { formatDescription, getTitle } from "@/lib/utils";
import AnimeStatusIndicator from "@/components/anime/anime-status-indicator";
import { useState } from "react";
import { ImageSkeleton } from "@/components/image-skeleton";

type AnimeCardProps = {
  id: Anime['id']
  title: Anime['title']
  coverImage: Anime['coverImage']
  averageScore: Anime["averageScore"]
  status: Anime["status"]
  genres: Anime["genres"]
  description: Anime["description"]
  episodes: Anime["episodes"]
  season: Anime["season"]
  seasonYear: Anime["seasonYear"]
}

export default function AnimeCard({ 
  id,
  title,
  coverImage,
  averageScore,
  status,
  genres,
  description,
  episodes,
  season,
  seasonYear,
 }: AnimeCardProps) {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState<boolean>(true)

  const handleClick = () => {
    router.push(`/info/${id}`);
  };
  
  return (
    <Card 
      className="
        h-full flex flex-col hover:shadow-lg overflow-hidden cursor-pointer
        hover:scale-105 transition-all p-0 m-0
      "
      onClick={handleClick}
    >
      <div className="relative h-52 w-full overflow-hidden">
        {coverImage?.large ? (
          <div className="absolute inset-0 mx-2 mt-2">
            {imageLoading && <ImageSkeleton />}
            <Image
              src={coverImage.large}
              alt={getTitle(title)}
              fill
              className="object-cover rounded-sm"
              onLoadingComplete={() => setImageLoading(false)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="flex items-center gap-1 bg-black/70 text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {averageScore ? (averageScore / 10).toFixed(1) : "N/A"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="px-4">
        <div className="flex flex-row gap-2">
          <AnimeStatusIndicator status={status} />
          <h3 className="font-bold text-lg line-clamp-1" title={getTitle(title)}>{getTitle(title)}</h3>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {genres?.slice(0, 3).map((genre, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {formatDescription(description)}
        </p>
      </CardContent>
      
      <CardFooter className="pb-4 px-4  text-sm text-gray-500 flex justify-between">
        <div>
          {episodes ? `${episodes} episodes` : "? episodes"}
        </div>
        <div>
          {season && seasonYear ? `${season} ${seasonYear}` : 
           seasonYear ? `${seasonYear}` : "Unknown date"}
        </div>
      </CardFooter>
    </Card>
  );
}

export function AnimeCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden p-0 m-0 animate-pulse">
      <div className="relative h-52 w-full overflow-hidden">
        <div className="absolute inset-0 mx-2 mt-2">
          <Skeleton className="h-full w-full rounded-sm" />
        </div>
      </div>
      
      <CardHeader className="px-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex flex-wrap gap-1 mt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      </CardHeader>
      
      <CardContent className="px-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      
      <CardFooter className="pb-4 px-4 text-sm flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  );
}