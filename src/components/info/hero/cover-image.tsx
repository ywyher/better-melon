import { AnimeCoverImage, AnimeTitle } from "@/types/anime";
import Image from "next/image";

export default function HeroCoverImage({ coverImage, title, episodes, duration }: {
  coverImage: AnimeCoverImage;
  title: AnimeTitle;
  episodes: number;
  duration: number;
}) {
  return (
    <div
      className="
        relative h-[400px] w-[280px]
        hover:scale-105 transition-all duration-300
        rounded-lg
      "
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background to-background opacity-30 z-[3] backdrop-blur-md rounded-lg" />
      <div className="shadow-[0_0_50px_#fff] absolute inset-0 animate-pulse rounded-lg" />
      <Image
        src={coverImage.extraLarge || coverImage.large}
        alt={title.english}
        fill
        className="rounded-lg"
      />
      <div
        className="
          absolute bottom-5 left-5 z-10
          flex flex-row gap-3
          rounded-lg
        "
      >
        <div className="flex flex-col gap-2 items-center">
          <div className="text-xs font-300">Episodes</div>
          <div className="font-bold text-lg">{episodes}</div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="text-xs font-300">Duration</div>
          <div className="font-bold text-lg">{duration}</div>
        </div>
      </div>
    </div>
  );
}