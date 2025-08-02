import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/utils";
import { ReactNode } from "react"

export default function AnimeCardWrapper({ children, className = "", handleClick }: {
  children: ReactNode;
  className?: string;
  handleClick: () => void
}) {
  return (
    <Card
      className={cn(
        "aspect-[3/4] relative p-0 max-h-100 w-50 bg-transparent",
        "border-0 outline-0 shadow-none",
        "flex flex-col gap-2",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </Card>
  )
}