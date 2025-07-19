import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

export function InfoHeroWatchButton({ id }: { id: string | number }) {
  return (
    <Button
      className="
        w-fit !px-10 !py-5
        hover:scale-110 transition-all
        shadow-[0_0_10px_#fff]
      "
      asChild
    >
      <Link
        href={`/watch/${id}/1`}
        className="font-bold"
      >
        <Play fill="black" />
        Watch Now
      </Link>
    </Button>
  );
}