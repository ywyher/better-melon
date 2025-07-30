import { PlusCircle, ArrowRight } from "lucide-react";

interface MoreCardProps {
  onClick: () => void;
}

export default function MoreCard({ onClick }: MoreCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        min-w-50 h-70 p-0
        relative
        flex flex-col items-center justify-center gap-4
        bg-gradient-to-br from-gray-900 to-black
        border-2 border-dashed border-gray-700
        rounded-sm
        cursor-pointer
        hover:border-gray-500
        hover:shadow-lg
        hover:-translate-y-1.5
        transition-all duration-300
        group
        overflow-hidden
      "
    >
      {/* Background pattern */}
      <div className="
        absolute inset-0 
        opacity-5 
        bg-gradient-to-br from-gray-600 to-gray-800
        group-hover:opacity-10
        transition-opacity duration-300
      " />
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <div className="
          relative
          p-4
          rounded-full
          bg-gray-800
          shadow-md
          group-hover:shadow-xl
          group-hover:scale-110
          transition-all duration-300
        ">
          <PlusCircle
            size={32}
            className="
              text-gray-300 
              group-hover:text-white 
              transition-colors duration-300
            " 
          />
        </div>
        
        <div className="text-center">
          <span className="
            text-gray-300
            group-hover:text-white
            font-semibold text-lg
            transition-colors duration-300
            block
          ">
            View More
          </span>
          <span className="
            text-gray-500
            group-hover:text-gray-300
            text-sm
            transition-colors duration-300
            flex items-center justify-center gap-1 mt-1
          ">
            Explore all
            <ArrowRight 
              size={14} 
              className="
                group-hover:translate-x-1 
                transition-transform duration-300
              " 
            />
          </span>
        </div>
      </div>
    </div>
  );
}