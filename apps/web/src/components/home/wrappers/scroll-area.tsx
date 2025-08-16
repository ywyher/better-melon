import MoreCard from "@/components/more-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ReactNode } from "react";

export default function ListScrollAreaWrapper({ 
  onMoreClick,
  showMore = true,
  children
}: {
  onMoreClick?: () => void;
  showMore?: boolean;
  children: ReactNode;
}) {
  return (
    <ScrollArea
      className="
        h-fit w-full
        overflow-x-scroll whitespace-nowrap
      "
    >
      <div className="flex flex-row gap-8 w-max py-2">
        {children}
        {showMore && <MoreCard onClick={() => {
          if(onMoreClick) onMoreClick()
        }} />}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}