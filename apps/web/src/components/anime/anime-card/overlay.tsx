import { Play } from "lucide-react";

export default function AnimeCardOverlay() {
  return (
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
  );
}