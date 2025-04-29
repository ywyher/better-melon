import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Anime } from "@/types/anime"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type AnimeLayoutProps = {
    bannerImage: Anime['bannerImage']
    title: Anime['title']
    children: React.ReactNode
    router: AppRouterInstance
}

export function AnimeLayout({ bannerImage, title, router, children }: AnimeLayoutProps) {
    return (
        <div>
            {/* Back Button */}
            <div className="mb-4">
                <Button 
                    variant="ghost" 
                    className="flex items-center gap-1" 
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft size={16} />
                    <span>Go Back</span>
                </Button>
            </div>
            
            {/* Banner Image */}
            {bannerImage && (
                <div className="relative w-full h-48 md:h-64 lg:h-80 mb-6 rounded-lg overflow-hidden">
                    <Image 
                        src={bannerImage} 
                        alt={title.english || ""}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
            )}

            {children}
        </div>
    )
}