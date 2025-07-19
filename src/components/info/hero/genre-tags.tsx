import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function InfoHeroGenreTags({ genres }: { genres: string[] }) {
  return (
    <div className="flex flex-row gap-2">
      {genres.join(',').split(',').map((g) => (
        <Badge
          key={g}
          asChild
          variant="secondary"
          className="
            hover:scale-110 transition-all
            bg-black/40 px-4 py-1
            hover:!bg-primary/20
          "
        >
          <Link href={`/search?genres=${g}`}>
            {g}
          </Link>
        </Badge>
      ))}
    </div>
  );
}