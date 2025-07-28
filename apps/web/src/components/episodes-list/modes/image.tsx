import { ImageSkeleton } from "@/components/image-skeleton";
import { cn } from "@/lib/utils/utils";
import { Anime } from "@/types/anime";
import { KitsuAnimeEpisode } from "@/types/kitsu";
import { AnilistTitle } from "@better-melon/shared/types";
import { Play } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useState } from "react";

interface ImageViewProps {
  episodes: KitsuAnimeEpisode[];
  currentEpisode: number;
  animeId: Anime['id'];
  router: AppRouterInstance;
  animeTitle: AnilistTitle;
  animeBanner: Anime['bannerImage']
  spoilerMode?: boolean;
}

export default function ImageView({ 
  episodes,
  currentEpisode, 
  animeId, 
  router,
  animeTitle,
  animeBanner,
  spoilerMode = false,
}: ImageViewProps) {
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-4">
      {episodes.map((ep) => {
        const number = ep.attributes.number
        const isActive = number == currentEpisode;
        return (
          <div
            key={number}
            onClick={() => router.push(`/watch/${animeId}/${number}`)}
            className={cn(
              "flex flex-row rounded-lg overflow-hidden cursor-pointer bg-primary-foreground",
              "text-muted-foreground border-1 border-transparent",
              "hover:bg-accent hover:scale-[1.009] transition-all",
              "transition-all duration-200 hover:bg-[#2B2B2B]",
              "hover:text-white hover:border-white",
              isActive && "bg-accent"
            )}
          >
            {/* Left side - Image with episode number */}
            <div className="relative h-24 w-36 flex-shrink-0">
              {/* Episode image or placeholder */}
              <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                {((spoilerMode ? animeBanner : ep.attributes.thumbnail?.original) && imageLoading) && <ImageSkeleton />}
                {(spoilerMode ? animeBanner : ep.attributes.thumbnail?.original) ? (
                  <Image 
                    src={spoilerMode ? (animeBanner || "") : (ep.attributes.thumbnail?.original || (animeBanner || ""))}
                    alt={`Ep: ${number}`}
                    fill
                    priority
                    className="w-full h-full object-cover"
                    onLoadingComplete={() => setImageLoading(false)}
                  />
                ) : (
                  <div className="text-gray-600">No Image</div>
                )}
              </div>
              
              {/* Episode number floating on image */}
              <div className="text-sm absolute bottom-2 left-2 bg-black/70 text-white px-2 rounded-md">
                EP: {number}
              </div>
              
              {/* Play button for active episode */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={28} fill="#fff" stroke="none" />
                </div>
              )}
            </div>
            
            {/* Right side - Text content */}
            <div className="flex flex-col gap-2 p-3 flex-grow">
              <h3 className={cn(
                "font-medium text-xs",
                isActive ? "text-white" : "text-gray-300"
              )}>
                {spoilerMode ? animeTitle.english : ep.attributes.canonicalTitle}
              </h3>

              <p className="text-xs text-gray-400 line-clamp-2">
                {spoilerMode
                  ? ""
                  : (ep.attributes.description || "No description available for this episode.")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}