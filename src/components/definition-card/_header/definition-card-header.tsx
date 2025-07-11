'use client'

import DefinitionCardHeaderAnki from "@/components/definition-card/_header/components/anki";
import DefinitionCardHeaderClose from "@/components/definition-card/_header/components/close";
import DefinitionCardHeaderExpand from "@/components/definition-card/_header/components/expand";
import DefinitionCardHeaderWordStatus from "@/components/definition-card/_header/components/word-status";
import { RubyText } from "@/components/ruby-text";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { JMdictWord } from "@/types/jmdict";
import { SubtitleToken } from "@/types/subtitle";

type DefinitionCardHeaderProps = {
  token: SubtitleToken
  entries?: JMdictWord[] | null
}

export default function DefinitionCardHeader({ token, entries }: DefinitionCardHeaderProps) {
  const furigana = useDefinitionStore((state) => state.furigana)
  
  return (
    <CardHeader className="flex flex-row justify-between items-center p-0">
      <CardTitle>
        <RubyText
          baseText={token.original_form}
          rubyText={furigana || ""}
        />
      </CardTitle>
      <div className='flex flex-row gap-2 items-center'>
        <DefinitionCardHeaderWordStatus word={token?.original_form || ""} />
        <DefinitionCardHeaderAnki entries={entries} />
        <DefinitionCardHeaderExpand />
        <DefinitionCardHeaderClose />
      </div>
    </CardHeader>
  )
}