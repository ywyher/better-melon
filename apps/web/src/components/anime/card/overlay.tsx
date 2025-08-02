import { Play } from "lucide-react";

export default function AnimeCardOverlay() {
  return (
    <>
      {/* Permanent bottom gradient overlay */}
      <div className="
        absolute inset-x-0 bottom-0 h-20
        bg-gradient-to-t from-black/60 to-transparent
        rounded-sm
      " />
      
      {/* Hover overlay with play button */}
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
    </>
  );
}