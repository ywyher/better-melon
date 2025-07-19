import { Badge } from "@/components/ui/badge";

export default function AnimeCardInfoBadge({ 
  children,
  variant = "outline",
  className = "" 
}: { 
  children: React.ReactNode;
  variant?: 'outline' | 'default' | 'secondary'
  className?: string;
}) {
  return (
    <Badge 
      variant={variant}
      className={`hover:bg-white hover:text-black transition-all cursor-pointer ${className}`}
    >
      {children}
    </Badge>
  );
}