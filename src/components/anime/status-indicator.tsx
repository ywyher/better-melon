import { Anime } from "@/types/anime";

export default function AnimeStatusIndicator({ status }: { status: Anime['status'] }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'RELEASING':
        return {
          bgColor: 'bg-green-500',
          pulseColor: 'bg-green-400',
          shadow: 'shadow-green-500/50',
          label: 'Releasing'
        };
      case 'FINISHED':
        return {
          bgColor: 'bg-blue-500',
          pulseColor: 'bg-blue-400',
          shadow: 'shadow-blue-500/50',
          label: 'Finished'
        };
      case 'NOT_YET_RELEASED':
        return {
          bgColor: 'bg-amber-500',
          pulseColor: 'bg-orange-400',
          shadow: 'shadow-amber-500/50',
          label: 'Not Yet Released'
        };
      case 'CANCELLED':
        return {
          bgColor: 'bg-red-500',
          pulseColor: 'bg-red-400',
          shadow: 'shadow-red-500/50',
          label: 'Cancelled'
        };
      case 'HIATUS':
        return {
          bgColor: 'bg-purple-500',
          pulseColor: 'bg-purple-400',
          shadow: 'shadow-purple-500/50',
          label: 'Hiatus'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          pulseColor: 'bg-gray-400',
          shadow: 'shadow-gray-500/50',
          label: 'Unknown'
        };
    }
  };

  const { bgColor, pulseColor, shadow } = getStatusStyles();

  return (
    <div className="flex items-center gap-2 p-1">
      <div className="relative flex items-center justify-center">
        <div 
          className={`h-3 w-3 rounded-full ${bgColor} animate-pulse ${shadow}`}
        />
          <div 
            className={`absolute h-5 w-5 rounded-full ${pulseColor} opacity-75 animate-ping`}
            style={{ animationDuration: '1.5s' }}
          />
      </div>
    </div>
  );
}