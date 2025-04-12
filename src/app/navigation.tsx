"use client"

import Header from "@/components/header"
import Bottombar from "@/components/sidebar/bottombar"
import { useIsSmall } from "@/hooks/useMediaQuery"

export default function Navigation({ children }: { children: React.ReactNode }) {
    const isSmall = useIsSmall()
    
    return (
        <>
            {isSmall ? (
                <>
                    <Header />
                    {children}
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