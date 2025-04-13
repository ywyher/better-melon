'use client'

import AnkiSettings from "@/app/settings/anki/_components/anki-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
    return (
        <>
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