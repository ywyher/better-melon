"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EpisodesListSkeleton() {
  const skeletonItems = Array(5).fill(null);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-row items-center w-full">
          <div className="flex flex-row gap-2 items-center w-full">
            {/* Chunk selector skeleton */}
            <Skeleton className="w-28 h-9 rounded-md" />
            
            {/* Search input skeleton */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground/30" />
              <Skeleton className="w-full h-9 rounded-md" />
            </div>
          </div>
          
          {/* Control buttons skeleton */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              disabled
            >
              <Eye size={18} className="text-muted-foreground/30" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              disabled
            >
              <ImageIcon size={18} className="text-muted-foreground/30" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-4">
          {skeletonItems.map((_, index) => (
            <div 
              key={index}
              className="flex flex-row rounded-lg overflow-hidden bg-[#141414]"
            >
              {/* Left side - Image skeleton */}
              <div className="relative h-24 w-36 flex-shrink-0">
                <Skeleton className="w-full h-full" />
                
                {/* Episode number skeleton */}
                <div className="absolute bottom-2 left-2">
                  <Skeleton className="w-12 h-5 rounded-md" />
                </div>
              </div>
              
              {/* Right side - Text content skeleton */}
              <div className="flex flex-col p-3 flex-grow">
                {/* Title skeleton */}
                <Skeleton className="w-3/4 h-5 mb-2 rounded-md" />
                
                {/* Description skeleton - two lines */}
                <Skeleton className="w-full h-3 mb-1 rounded-md" />
                <Skeleton className="w-4/5 h-3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}