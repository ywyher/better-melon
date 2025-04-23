import Search from "@/components/header/search/search";
import { Button } from "@/components/ui/button";
import { TvMinimalPlay } from "lucide-react";
import Link from "next/link";

export default function HeaderTabs() {
    return (
        <div className="flex flex-row gap-2">
            <Search />
            <Link href={'/search'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <TvMinimalPlay className="h-4 w-4" />
                    Anime
                </Button>
            </Link>
            <Link href={'/playground'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <TvMinimalPlay className="h-4 w-4" />
                    playground
                </Button>
            </Link>
        </div>
    )
}