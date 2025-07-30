import { Button } from "@/components/ui/button";
import { Anime } from "@/types/anime";
import { Info, Play } from "lucide-react";
import Link from "next/link";

export default function TopTrendingActionButtons({ animeId }: { animeId: Anime['id'] }) {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <Button 
        className="
          flex flex-row items-center gap-2 !px-6
          w-full lg:w-fit
        "
        asChild
      >
        <Link href={`/watch/${animeId}/1`}>
          <Play fill="black" />
          Watch
        </Link>
      </Button>
      <Button 
        className="
          flex flex-row items-center gap-2 !px-6
          w-full lg:w-fit
        "
        variant="outline"
        asChild
      >
        <Link href={`/info/${animeId}`}>
          <Info />
          Details
        </Link>
      </Button>
    </div>
  );
}