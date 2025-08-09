"use client"

import Header from "@/components/header/header"
import Bottombar from "@/components/sidebar/bottombar"
import { Separator } from "@/components/ui/separator"
import { useIsSmall } from "@/lib/hooks/use-media-query"

export default function Navigations({ children }: { children: React.ReactNode }) {
    const isSmall = useIsSmall()

    return (
        <>
            {isSmall ? (
                <div className="flex flex-col">
                    <Header />
                    <Separator className="z-40" />
                    <div className="pb-[calc(1rem+var(--bottombar-height))] mt-5">
                        {children}
                    </div>
                    <Bottombar />
                </div>
            ): (
                <div className="flex flex-col">
                    <Header />
                    <div className="mt-5">
                        {children}
                    </div>
                </div>
            )}
        </>
    )
}