import AnkiError from "@/app/profile/settings/_components/anki/anki-error"
import AnkiPreset from "@/app/profile/settings/_components/anki/anki-preset"
import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { invokeAnkiConnect } from "@/lib/anki"

export default async function Profile() {
    const checkConnection = await invokeAnkiConnect('deckNames', 6)

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
                    {checkConnection.error ? (
                        <AnkiError />
                    ): (
                        <AnkiPreset />
                    )}
                </TabsContent>
            </Tabs>
        </>
    )
}