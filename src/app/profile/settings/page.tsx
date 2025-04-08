'use client'

import AnkiError from "@/app/profile/settings/_components/anki/anki-error"
import AnkiPreset from "@/app/profile/settings/_components/anki/anki-preset"
import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from '@tanstack/react-query'

export default function Profile() {
    const { error, isLoading } = useQuery({
        queryKey: ['ankiConnection'],
        queryFn: async () => {
            try {
                const response = await fetch('http://localhost:8765', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        action: 'deckNames', 
                        version: 6 
                    }),
                })
                
                const data = await response.json()
                
                if (data.error) {
                    throw new Error(data.error)
                }
                
                return data.result
            } catch (error) {
                console.error('Error connecting to Anki:', error)
                throw error
            }
        },
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return (
        <>
            <Header />
            <Tabs defaultValue="anki" className="flex flex-col gap-5 py-5 px-10">
                <TabsList className="w-full">
                    <TabsTrigger className="w-full cursor-pointer" value="anki">Anki</TabsTrigger>
                </TabsList>
                <TabsContent
                    className="h-screen justify-center items-center flex"
                    value="anki"
                >
                    {isLoading ? (
                        <div>Checking Anki connection...</div>
                    ) : error ? (
                        <>
                            {error.message}
                            <AnkiError />
                        </>
                    ) : (
                        <>
                        WORKING
                          <AnkiPreset />
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </>
    )
}