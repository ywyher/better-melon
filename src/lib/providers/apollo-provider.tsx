'use client'

import { ApolloClient, InMemoryCache, ApolloProvider as MainApolloProvider } from '@apollo/client';

export default function ApolloProvider({ children }: { children: React.ReactNode }) {
    const client = new ApolloClient({
        uri: 'https://graphql.anilist.co',
        cache: new InMemoryCache(),
      });
      
    return (
        <MainApolloProvider client={client}>
            {children}
        </MainApolloProvider>
    )
}