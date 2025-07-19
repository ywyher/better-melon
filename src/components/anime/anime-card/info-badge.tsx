import { Badge } from "@/components/ui/badge";

export default function AnimeCardInfoBadge({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge 
      variant="outline"
      className={`hover:bg-white hover:text-black transition-all cursor-pointer ${className}`}
    >
      {children}
    </Badge>
  );
}