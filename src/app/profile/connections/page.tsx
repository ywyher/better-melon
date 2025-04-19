"use client"

import ConnectionCard from "@/app/settings/connections/_components/connection-provider-card";
import { authClient } from "@/lib/auth-client";
import { OAuthProviders } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Connections() {

    const { data } = useQuery({
        queryKey: ['accounts-list'],
        queryFn: async () =>{ 
            return await authClient.listAccounts()
        }
    })

    const isConnected = (provider: OAuthProviders) => {
        return data?.data?.find(d => d.provider == provider) ? true : false
    }

    return (
        <>
            <ConnectionCard
                provider="anilist"
                connected={isConnected('anilist')}
            />
        </>
    )
}