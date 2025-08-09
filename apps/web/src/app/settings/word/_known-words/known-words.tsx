import AddKnownWords from "@/app/settings/word/_known-words/add-known-words";
import ImportKnownWordsFromAnki from "@/app/settings/word/_known-words/import-known-words-from-anki";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Download } from "lucide-react";

export default function KnownWords() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Manage Known Words</h2>
        <p className="text-muted-foreground">
          Build your vocabulary by adding words you already know or importing from Anki
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <PlusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Add Words Manually</CardTitle>
                <CardDescription>
                  Type or paste words you want to mark as known
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Paste text and we&apos;ll extract Japanese words</p>
                <p>• Words are automatically validated</p>
                <p>• Duplicates are safely handled</p>
              </div>
              <AddKnownWords />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Import from Anki</CardTitle>
                <CardDescription>
                  Sync your reviewed cards from an Anki deck
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Import learned cards from any deck</p>
                <p>• Only includes reviewed cards</p>
                <p>• Automatically extracts Japanese words</p>
              </div>
              <ImportKnownWordsFromAnki />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}