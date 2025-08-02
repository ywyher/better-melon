'use client'

import DefinitionCardHeaderAnki from "@/components/definition-card/_header/components/anki";
import DefinitionCardHeaderClose from "@/components/definition-card/_header/components/close";
import DefinitionCardHeaderExpand from "@/components/definition-card/_header/components/expand";
import DefinitionCardHeaderWordStatus from "@/components/definition-card/_header/components/word-status";
import Ruby from "@/components/ruby";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { pitchAccentsStyles } from "@/lib/constants/pitch";
import { useTranscriptionItem } from "@/lib/hooks/use-transcription-item";
import { parseRuby } from "@/lib/utils/subtitle";
import { JMdictWord } from "@/types/jmdict";
import { SubtitleToken } from "@/types/subtitle";
import { useMemo } from "react";

type DefinitionCardHeaderProps = {
  token: SubtitleToken
  entries?: JMdictWord[] | null
}

export default function DefinitionCardHeader({ token, entries }: DefinitionCardHeaderProps) {
  const { getTokenAccent } = useTranscriptionItem('japanese')

  const pairs = parseRuby(token.surface_form, true)
  const accent = useMemo(() => getTokenAccent(token), [token]);

  return (
    <CardHeader className="flex flex-row justify-between items-center p-0">
      <CardTitle
        className='flex flex-row items-end'
      >
        {pairs.map((pair, pairIdx) => {
          const { furigana, kanji } = pair
          return (
            <Ruby
              key={pairIdx}
              kanji={kanji}
              furigana={furigana}

              kanjiStyles={{
                text: {
                  fontSize: 20
                }
              }}
              furiganaStyles={{
                text: {
                  fontSize: 15,
                }
              }}

              styles={{
                ...(accent && pitchAccentsStyles[accent])
              }}
            />
          )
        })}
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