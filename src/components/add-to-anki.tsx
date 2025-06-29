import { Button } from "@/components/ui/button";
import useAddToAnki from "@/lib/hooks/use-add-to-anki";
import React from "react";
import { toast } from "sonner";

type AddToAnkiProps = {
  kanji: string;
  definition: string;
  children: React.ReactNode
  sentenceKanji?: string;
  sentenceEnglish?: string;
  sentenceKana?: string;
  kana?: string;
  partOfSpeech?: string;
  disabled?: boolean
}

export default function AddToAnki({
  kanji,
  kana,
  definition,
  sentenceKanji,
  sentenceEnglish,
  sentenceKana,
  partOfSpeech,
  children,
  disabled = false
}: AddToAnkiProps) {
  const { addToAnki } = useAddToAnki({
    fields: {
      kanji,
      kana,
      definition,
      "sentence-kanji": sentenceKanji,
      "sentence-english": sentenceEnglish,
      "sentence-kana": sentenceKana,
      "part-of-speech": partOfSpeech
    },
  })

  return (
    <Button
      className="cursor-pointer z-20 rounded-sm p-1 w-fit h-7"
      onClick={() => {
        if(!disabled) {
          addToAnki()
        }else {
          toast.warning('Either disabled or loading')
        }
      }}
    >
      {children}
    </Button>
  )
}