"use client"

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { AlertCircle } from "lucide-react";
import { userQueries, useSession } from "@/lib/queries/user";
import { AnimeListProivders } from "@/types/anime-list";
import { animeListProviders } from "@/lib/constants/anime-list";
import AnimeListProviderCard from "@/app/settings/anime-lists/_components/anime-list-provider-card";

export default function AnimeLists() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    
    const { data: user } = useSession()

    const { data: connectedProviders, isLoading: isConnectedProvidersLoading } = useQuery({ ...userQueries.listAccounts() })

    useEffect(() => {
      if(user) {
        setIsAuthenticated(true)
      }
    }, [user])

    const isConnected = (provider: AnimeListProivders) => {
        return connectedProviders?.find(d => d.provider === provider) ? true : false
    }

    return (
        <div className="flex flex-col gap-6">
            <Card className="border-0 p-0 shadow-md">
                <CardHeader className="p-0">
                    <div className="flex flex-row gap-2 items-start">
                        <CardTitle className="text-2xl">Connect Your Anime Lists</CardTitle>
                        {!isAuthenticated && (
                            <TooltipWrapper
                                trigger={<AlertCircle className="w-5 h-5 text-amber-300 cursor-pointer mt-1" />}
                            >
                                <>Authentication required</>
                            </TooltipWrapper>
                        )}
                    </div>
                    <CardDescription className="text-base">
                        Link your accounts to access additional features and services
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-wrap gap-4">
                        {isConnectedProvidersLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 bg-secondary rounded-lg w-full">
                                    <Skeleton className="w-12 h-12 rounded-md" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            ))
                        ) : (
                          animeListProviders.map((provider) => {
                                const connected = isConnected(provider.name);
                                
                                return (
                                  <AnimeListProviderCard
                                    key={provider.name}
                                    provider={provider}
                                    isConnected={connected}
                                    isAuthenticated={isAuthenticated}
                                  />
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}