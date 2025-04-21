"use client"

import Header from "@/components/header"
import Bottombar from "@/components/sidebar/bottombar"
import { useIsSmall } from "@/hooks/useMediaQuery"

export default function Navigations({ children }: { children: React.ReactNode }) {
    const isSmall = useIsSmall()
    
    return (
        <>
            {isSmall ? (
                <>
                    <Header />
                    <div className="pb-[calc(1rem+var(--bottombar-height))]">
                        {children}
                    </div>
                    <Bottombar />
                </>
            ): (
                <>
                  <Header />
                  {children}
                </>
            )}
        </>
    )
}