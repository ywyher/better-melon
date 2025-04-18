"use client"

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, getSession } from "@/lib/auth-client";
import { User } from "@/lib/db/schema";
import { ConnectionProviders } from "@/types";
import ConnectionProviderCard from "@/app/settings/connections/_components/connection-provider-card";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { AlertCircle } from "lucide-react";
import { connectionProviders } from "@/lib/constants";

export default function Connections() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["session", "header"],
        queryFn: async () => {
            const { data } = await getSession()
            return (data?.user as User) || null;
        },
    });

    const { data: connectedProviders, isLoading: isConnectedProvidersLoading } = useQuery({
        queryKey: ['connections', 'providers-list'],
        queryFn: async () =>{ 
            const { data } = await authClient.listAccounts()
            return data;
        }
    })

    useEffect(() => {
        if(user) {
            setIsAuthenticated(true)
        }
    }, [user])

    const isConnected = (provider: ConnectionProviders) => {
        return connectedProviders?.find(d => d.provider === provider) ? true : false
    }

    return (
        <div className="flex flex-col gap-6 pt-4">
            <Card className="border-0 p-0 shadow-md">
                <CardHeader className="p-0">
                    <div className="flex flex-row gap-2 items-start">
                        <CardTitle className="text-2xl">Connect Your Accounts</CardTitle>
                        {!isAuthenticated && (
                            <TooltipWrapper
                                tooltip="Authentication required"
                            >
                                <AlertCircle className="w-5 h-5 text-amber-300 cursor-pointer mt-1" />
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
                            // Loading skeleton for providers
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
                            connectionProviders.map((provider) => {
                                const connected = isConnected(provider.name);
                                
                                return (
                                    <ConnectionProviderCard
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