'use client'

import DialogWrapper from "@/components/dialog-wrapper";
import { ankiQueries } from "@/lib/queries/anki";
import { useQuery, useMutation } from "@tanstack/react-query";
import AnkiError from "@/app/settings/anki/_components/anki-error";
import { SelectInput } from "@/components/form/select-input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { invokeAnkiConnect } from "@/lib/anki";
import { toast } from "sonner";
import { AnkiNote } from "@/types/anki";
import { addWordsBulk } from "@/app/settings/words/actions";
import LoadingButton from "@/components/loading-button";

export default function ImportKnownWordsFromAnki() {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedDeck, setSelectedDeck] = useState<string>("")
  
  const { data: deckNames, isLoading, error } = useQuery(ankiQueries.deckNames())

  const importMutation = useMutation({
    mutationFn: async (deckName: string) => {
      const noteIdsQuery = `deck:"${deckName}" is:review -is:suspended -is:buried`
      
      const noteIdsRes = await invokeAnkiConnect('findNotes', 6, { query: noteIdsQuery })
      
      if (!noteIdsRes.data || noteIdsRes.data.length === 0) {
        throw new Error('No learned cards found in this deck')
      }

      const notesRes = await invokeAnkiConnect('notesInfo', 6, { notes: noteIdsRes.data })
      
      if (!notesRes.data) {
        throw new Error('Failed to fetch note information')
      }

      const knownWords: string[] = notesRes.data.map((note: AnkiNote) => {
        const fieldNames = Object.keys(note.fields)
        const kanjiFieldName = fieldNames.find(fieldName => 
          fieldName.toLowerCase().includes('kanji')
        )
        
        const targetField = kanjiFieldName 
          ? note.fields[kanjiFieldName]?.value 
          : note.fields[fieldNames[0]]?.value
          
        return targetField?.replace(/<[^>]*>/g, '').trim() // Remove HTML tags
      }).filter(Boolean)

      toast.success(`${knownWords.length} words found, now importing.`)

      await addWordsBulk({
        words: knownWords,
        status: 'known'
      })
      
      return {
        count: knownWords.length,
        words: knownWords
      }
    },
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.count} known words!`)
      setOpen(false)
      setSelectedDeck("")
    },
    onError: (error) => {
      console.error('Import failed:', error)
      toast.error(`Import failed: ${error.message}`)
    }
  })

  const handleConfirm = () => {
    if (selectedDeck) {
      importMutation.mutate(selectedDeck)
    }
  }

  const trigger = (
    <Button className="w-full" variant='secondary'>
      Import from an anki deck
    </Button>
  )

  return (
    <DialogWrapper
      trigger={trigger}
      title={<p className="text-center">Import known words from anki</p>}
      headerClassName="p-0"
      className="min-w-fit"
      open={open}
      setOpen={setOpen}
    >
      {isLoading || !deckNames?.data ? (
        <AnkiError />
      ) : error ? (
        <div className="text-center text-red-500">
          <p>Failed to load Anki decks</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <SelectInput 
            options={deckNames.data.map((deck: string) => ({
              label: deck,
              value: deck
            }))}
            onChange={setSelectedDeck}
            disabled={importMutation.isPending}
          />

          <LoadingButton
            className="w-full"
            onClick={handleConfirm}
            disabled={!selectedDeck || importMutation.isPending}
            isLoading={importMutation.isPending}
          >
            Confirm
          </LoadingButton>
        </div>
      )}
    </DialogWrapper>
  )
}