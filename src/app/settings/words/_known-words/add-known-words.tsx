'use client'

import { addWordsBulk } from "@/app/settings/words/actions";
import DialogWrapper from "@/components/dialog-wrapper";
import { TextareaInput } from "@/components/form/textarea-input";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { useInitializeTokenizer } from "@/lib/hooks/use-initialize-tokenizer";
import { tokenizeText } from "@/lib/subtitle/actions";
import { useState } from "react";
import { toast } from "sonner";
import { isJapanese } from "wanakana";

export default function AddKnownWords() {
  const [words, setWords] = useState<string>("学校女妹見ろ")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(true)
  const { initalize } = useInitializeTokenizer()

  const handleChange = async () => {
    setIsLoading(true)

    try {
      await initalize()
      let validWords: string[] = [];
      const tokens = await tokenizeText(words);
      tokens?.map((t) => {
        if(isJapanese(t.surface_form)) {
          validWords.push(t.surface_form)
        }
      })
      
      if(!validWords.length) throw new Error("Hmm, no valid words were found in your input")

      const result = await addWordsBulk({ words: validWords, status: 'known' })
      
      if (result.error) throw new Error(result.error)
      
      toast.success(`${result.added} words added${result.skipped > 0 ? `, ${result.skipped} already existed` : ''}.`)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : `Failed to add words`
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const trigger = (
    <Button>
      Add words
    </Button>
  )

  return (
    <DialogWrapper
      open={open}
      setOpen={setOpen}
      trigger={trigger}
      headerClassName="py-0 px-0"
      title={<p className="text-center">Add words to your Known Word count</p>}
    >
      <TextareaInput
        className="h-36"
        placeholder="Paste or type a list of words here"
        onChange={setWords}
        value={words}
      />
      <div className="w-full flex flex-row gap-3">
        <Button
          onClick={() => setOpen(false)}
          variant={'destructive'}
          className="flex-1"
        >
          Cancel
        </Button>
        <LoadingButton
          disabled={!words}
          isLoading={isLoading}
          className="flex-1"
          onClick={() => handleChange()} 
        >
          Add words
        </LoadingButton>
      </div>
    </DialogWrapper>
  )
}