'use client'

import { env } from '@/lib/env/client';
import { ApolloClient, InMemoryCache, ApolloProvider as MainApolloProvider } from '@apollo/client';

export default function ApolloProvider({ children }: { children: React.ReactNode }) {
    const client = new ApolloClient({
        uri: env.NEXT_PUBLIC_ANILIST_URL,
        cache: new InMemoryCache(),
      });
      
    return (
        <MainApolloProvider client={client}>
            {children}
        </MainApolloProvider>
    )
}