import QuickSearch from "@/components/quick-search/quick-search";
import { Button } from "@/components/ui/button";
import { Play, Settings, TvMinimalPlay } from "lucide-react";
import Link from "next/link";

export default function HeaderLinks() {
    return (
        <div className="flex flex-row gap-2">
            <QuickSearch />
            <Link href={'/search'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <TvMinimalPlay className="h-4 w-4" />
                    Anime
                </Button>
            </Link>
            <Link href={'/settings'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
            </Link>
            <Link href={'/playground'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <Play className="h-4 w-4" />
                    Playground
                </Button>
            </Link>
            <Link href={'/watch/20661/5'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <Play className="h-4 w-4" />
                    Terror in resonance
                </Button>
            </Link>
            
            <Link href={'/watch/97986/9'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <Play className="h-4 w-4" />
                    Made in abyss
                </Button>
            </Link>
            
            <Link href={'/watch/21234/3'}>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-2 text-md"
                >
                    <Play className="h-4 w-4" />
                    Erased
                </Button>
            </Link>
        </div>
    )
}