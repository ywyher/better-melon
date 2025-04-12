'use client'

import AnkiSettings from "@/app/profile/settings/_components/anki/anki-settings"
import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Profile() {

    return (
        <>
            <Header />
            <Tabs defaultValue="anki" className="flex flex-col gap-5">
                <TabsList className="w-full">
                    <TabsTrigger className="w-full cursor-pointer" value="anki">Anki</TabsTrigger>
                </TabsList>
                <TabsContent
                    className="h-screen justify-center items-center flex"
                    value="anki"
                >
                    <AnkiSettings />
                </TabsContent>
            </Tabs>
        </>
    )
}