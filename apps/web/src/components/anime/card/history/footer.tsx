import { CardFooter } from "@/components/ui/card";

export default function AnimeHistoryCardFooter({ 
  percentage
}: {
  percentage: number
}) {
  return (
    <CardFooter className="p-0 m-0">
      <div className="text-sm text-accent-foreground/80">{percentage}% Watched</div>
    </CardFooter>
  );
}