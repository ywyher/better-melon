import { Button } from "@/components/ui/button";
import { ChevronRight, LucideIcon } from "lucide-react";

export default function AnimeListHeader({ 
  icon: Icon, 
  title,
  onViewAllClick
}: { 
  icon: LucideIcon; 
  title: string;
  onViewAllClick: () => void 
}) {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-5 items-center">
        <Icon color="#6366F1" size={30} />
        <span className="text-2xl font-bold">{title}</span>
      </div>
      <Button
        variant="outline"
        className="flex flex-row gap-3"
        onClick={onViewAllClick}
      >
        View All
        <ChevronRight />
      </Button>
    </div>
  );
}