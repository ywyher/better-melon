'use client'

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { jmdictTags } from "@/lib/constants/jmdict";
import useAddToAnki from "@/lib/hooks/use-add-to-anki";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { JMdictPos, JMdictWord } from "@/types/jmdict";
import { Expand, Plus, Shrink, X } from "lucide-react";

type DefinitionCardHeaderProps = {
  entries?: JMdictWord[] | null
}

export default function DefinitionCardHeader({ entries }: DefinitionCardHeaderProps) {
  const { 
    sentences,
    token,
    isExpanded,
    isAddToAnki,
    setSentences,
    setToken,
    setIsExpanded,
    setPosition
  } = useDefinitionStore()

  const { addToAnki } = useAddToAnki({ 
    fields: {
      kanji: token?.surface_form,
      kana: entries?.[0].kana[0].text,
      definition: entries?.[0].sense[0].gloss[0].text,
      "sentence-kanji": sentences.kanji ?? "",
      "sentence-kana": sentences.kana ?? "",
      "sentence-english": sentences.english ?? "",
      "part-of-speech": (entries?.[0].sense[0].partOfSpeech as JMdictPos[])
        ?.map(p => jmdictTags[p] || p) // Get tag value or fallback to original if not found
        .join(', ')
    }
  })

  const handleExpand = () => {
    if(!isExpanded) {
      setIsExpanded(true)
      setPosition({ x: 0, y: 0 })
    }else {
      setIsExpanded(false)
    }
  }

  const handleClose = () => {
    setSentences({
      kanji: null,
      kana: null,
      english: null,
    })
    setIsExpanded(false)
    setToken(null)
  }

  return (
    <CardHeader className="flex flex-row justify-between items-center p-0">
      <CardTitle>{token?.original_form}</CardTitle>
      <div className='flex flex-row gap-2'>
        {isAddToAnki && (
          <Button
            className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
            onClick={() => addToAnki()}
          >
            <Plus />
          </Button>
        )}
        <Button
          className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
          onClick={() => handleExpand()} 
        >
          {isExpanded ? <Shrink /> : <Expand />}
        </Button>
        <Button
          className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
          onClick={() => handleClose()} 
          variant='destructive'
          >
          <X />
        </Button>
      </div>
    </CardHeader>
  )
}