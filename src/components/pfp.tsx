import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Pfp({
  image = "/images/pfp.png",
  className,
}: {
  image?: string;
  className?: string;
}) {
  return (
    <Avatar className={cn(
      "cursor-pointer border",
      "w-12 h-12",
      "object",
      className,
    )}>
      <AvatarImage className="object-cover" src={image} alt="Profile picture" />
      <AvatarFallback>AS</AvatarFallback>
    </Avatar>
  );
}