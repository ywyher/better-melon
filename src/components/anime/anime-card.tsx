import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Anime, AnimeCoverImage, AnimeFormat, AnimeStatus, AnimeTitle } from "@/types/anime";
import { ImageSkeleton } from "@/components/image-skeleton";
import AnimeStatusIndicator from "@/components/anime/anime-status-indicator";
import { Badge } from "@/components/ui/badge";
import { Star, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { stripText } from "@/lib/utils/utils";

type AnimeCardProps = {
  id: Anime['id'];
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  status: AnimeStatus;
  format: AnimeFormat;
  seasonYear: Anime["seasonYear"]
  averageScore: Anime['averageScore']
}

export default function AnimeCard({ 
  id,
  title,
  coverImage,
  status,
  format,
  seasonYear,
  averageScore
 }: AnimeCardProps) {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState<boolean>(true)

  const handleClick = () => {
    router.push(`/info/${id}`);
  };
  
  return (
    <Card 
      className="
        relative w-50 h-70 p-0
        border-0 outline-0 shadow-none
        flex flex-col gap-2
      "
      onClick={handleClick}
    >
      <CardContent className="p-0 flex flex-col gap-3">
        <div 
          className="
            h-70 relative
            cursor-pointer
            group
            hover:-translate-y-1.5 transition-all
          "
        >
          {imageLoading && <ImageSkeleton />}
          <Image
            src={coverImage.extraLarge || coverImage.large}
            alt={String(id)}
            fill
            className="rounded-sm transition-all"
            loading="lazy"
            onLoadingComplete={() => setImageLoading(false)}
          />
          
          {/* Hover Overlay */}
          <div className="
            absolute inset-0 
            bg-black/50 
            opacity-0 group-hover:opacity-100 
            transition-opacity duration-300
            flex items-center justify-center
            rounded-sm
          ">
            <Play className="w-12 h-12 text-white" fill="white" />
          </div>
        </div>

        <div className="
          flex flex-row gap-2 pl-1 py-1
          cursor-pointer rounded-sm
          hover:bg-[#ffffff1a] transition-all
        ">
          <AnimeStatusIndicator animate={false} status={status} />
          <div className="font-bold text-sm">
            {stripText(title.english, 18)}
          </div>
        </div>
      </CardContent>
      <CardFooter
        className="
          flex flex-row gap-2
          pl-1
        "
      >
        <Badge 
          variant="outline"
          className="hover:bg-white hover:text-black transition-all cursor-pointer"
        >
          {format}
        </Badge>
        <Badge 
          variant="outline"
          className="hover:bg-white hover:text-black transition-all cursor-pointer"
        >
          {seasonYear}
        </Badge>
        <Badge 
          variant="outline"
          className="hover:bg-white hover:text-black transition-all cursor-pointer"
        >
          <Star />
          {averageScore}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export function AnimeCardSkeleton() {
  return (
    <Card 
      className="
        relative w-50 h-70 p-0
        border-0 outline-0 shadow-none
        flex flex-col gap-2
      "
    >
      <CardContent className="p-0 flex flex-col gap-3">
        {/* Image skeleton */}
        <div className="h-70 relative">
          <Skeleton className="w-full h-full rounded-sm" />
        </div>

        {/* Title section skeleton */}
        <div className="
          flex flex-row gap-2 pl-1 py-1
          rounded-sm
        ">
          {/* Status indicator skeleton */}
          <Skeleton className="w-3 h-3 rounded-full" />
          
          {/* Title skeleton */}
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter
        className="
          flex flex-row gap-2
          pl-1
        "
      >
        {/* Badge skeletons */}
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </CardFooter>
    </Card>
  );
}