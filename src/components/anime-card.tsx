import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Define TypeScript interfaces for the anime data
interface AnimeTitle {
  romaji: string;
  english: string | null;
}

interface AnimeCoverImage {
  large: string;
  medium: string;
}

interface AnimeProps {
  anime: {
    id: number;
    title: AnimeTitle;
    description: string | null;
    coverImage: AnimeCoverImage;
    bannerImage: string | null;
    episodes: number | null;
    season: string | null;
    seasonYear: number | null;
    averageScore: number | null;
    genres: string[];
    status: string;
  };
}

export default function AnimeCard({ anime }: AnimeProps) {
  const router = useRouter();

  // Format description by removing HTML tags
  const formatDescription = (desc: string | null): string => {
    if (!desc) return "No description available.";
    const plainText = desc.replace(/<[^>]+>/g, '');
    return plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;
  };

  // Get title, prioritizing English if available
  const title = anime.title.english || anime.title.romaji || "Unknown Title";
  
  const handleClick = () => {
    // For now, we'll just redirect to a placeholder page with the anime ID
    router.push(`/info/${anime.id}`);
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
        {anime.coverImage?.large ? (
          <div className="absolute inset-0 mx-2 mt-2">
            <Image
              src={anime.coverImage.large}
              alt={title}
              fill
              className="object-cover rounded-sm"
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
            {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="px-4">
        <h3 className="font-bold text-lg line-clamp-1" title={title}>{title}</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {anime.genres?.slice(0, 3).map((genre, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {formatDescription(anime.description)}
        </p>
      </CardContent>
      
      <CardFooter className="pb-4 px-4  text-sm text-gray-500 flex justify-between">
        <div>
          {anime.episodes ? `${anime.episodes} episodes` : "? episodes"}
        </div>
        <div>
          {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : 
           anime.seasonYear ? `${anime.seasonYear}` : "Unknown date"}
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