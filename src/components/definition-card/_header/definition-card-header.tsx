'use client'

import DefinitionCardHeaderAnki from "@/components/definition-card/_header/components/anki";
import DefinitionCardHeaderClose from "@/components/definition-card/_header/components/close";
import DefinitionCardHeaderExpand from "@/components/definition-card/_header/components/expand";
import DefinitionCardHeaderWordStatus from "@/components/definition-card/_header/components/word-status";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { JMdictWord } from "@/types/jmdict";

type DefinitionCardHeaderProps = {
  entries?: JMdictWord[] | null
}

export default function DefinitionCardHeader({ entries }: DefinitionCardHeaderProps) {
  const token = useDefinitionStore((state) => state.token)

  return (
    <CardHeader className="flex flex-row justify-between items-center p-0">
      <CardTitle>{token?.original_form}</CardTitle>
      <div className='flex flex-row gap-2 items-center'>
        <DefinitionCardHeaderWordStatus word={token?.original_form || ""} />
        <DefinitionCardHeaderAnki entries={entries} />
        <DefinitionCardHeaderExpand />
        <DefinitionCardHeaderClose />
      </div>
    </CardHeader>
  )
}