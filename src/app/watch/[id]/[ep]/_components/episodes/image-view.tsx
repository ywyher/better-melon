import { ImageSkeleton } from "@/components/image-skeleton";
import { cn } from "@/lib/utils";
import { Anime, AnimeEpisodeData } from "@/types/anime";
import { Play } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useState } from "react";

interface ImageViewProps {
  episodes: AnimeEpisodeData[];
  currentEpisode: number;
  animeId: Anime['id'];
  router: AppRouterInstance;
  spoilerMode?: boolean;
  animeData: Anime;
}

export default function ImageView({ 
  episodes, 
  currentEpisode, 
  animeId, 
  router,
  spoilerMode = false,
  animeData
}: ImageViewProps) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const genericTitle = animeData.title.english || "Episode";
  const genericImage = animeData.coverImage.medium || null;
  const genericDescription = animeData.description || "No description available for this episode.";

  return (
    <div className="flex flex-col gap-4">
      {episodes.map((ep) => {
        const isActive = ep.number == currentEpisode;
        return (
          <div
            key={ep.id}
            onClick={() => router.push(`/watch/${animeId}/${ep.number}`)}
            className={cn(
              "flex flex-row rounded-lg overflow-hidden cursor-pointer bg-[#141414]",
              "hover:scale-105 transition-all",
              "transition-all duration-200 hover:bg-[#2B2B2B]",
              isActive && "ring-1 ring-[#8080CF]"
            )}
          >
            {/* Left side - Image with episode number */}
            <div className="relative h-24 w-36 flex-shrink-0">
              {/* Episode image or placeholder */}
              <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                {((spoilerMode ? genericImage : ep.image) && imageLoading) && <ImageSkeleton />}
                {(spoilerMode ? genericImage : ep.image) ? (
                  <Image 
                    src={spoilerMode ? (genericImage || "") : (ep.image || "")}
                    alt={`Ep: ${ep.number}`}
                    fill
                    className="w-full h-full object-cover"
                    priority
                    onLoadingComplete={() => setImageLoading(false)}
                  />
                ) : (
                  <div className="text-gray-600">No Image</div>
                )}
              </div>
              
              {/* Episode number floating on image */}
              <div className="text-sm absolute bottom-2 left-2 bg-black/70 text-white px-2 rounded-md">
                EP: {ep.number}
              </div>
              
              {/* Play button for active episode */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={28} fill="#fff" stroke="none" />
                </div>
              )}
            </div>
            
            {/* Right side - Text content */}
            <div className="flex flex-col p-3 flex-grow">
              <h3 className={cn(
                "font-medium text-sm mb-1",
                isActive ? "text-white" : "text-gray-300"
              )}>
                {spoilerMode ? genericTitle : ep.title}
              </h3>
              
              <p className="text-xs text-gray-400 line-clamp-2">
                {spoilerMode && !isActive
                  ? genericDescription
                  : (ep.description || "No description available for this episode.")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}