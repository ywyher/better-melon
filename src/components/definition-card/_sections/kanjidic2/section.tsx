import Kanjidic2Header from "@/components/definition-card/_sections/kanjidic2/header"
import Kanjidic2Meaning from "@/components/definition-card/_sections/kanjidic2/meaning"
import Kanjidic2Literal from "@/components/definition-card/_sections/kanjidic2/literal"
import Kanjidic2Reading from "@/components/definition-card/_sections/kanjidic2/reading"
import Kanjidic2Misc from "@/components/definition-card/_sections/kanjidic2/misc"
import { Separator } from "@/components/ui/separator"
import DotSeparator from "@/components/dot-separator"
import type { Kanjidic2Character as TKanjidic2Character } from "@/types/kanjidic2"

type Kanjidic2Props = {
  entries: TKanjidic2Character[]
  sentences: {
    kanji: string
    english: string
  }
}

export default function Kanjidic2Section({ entries, sentences }: Kanjidic2Props) {
  if(!entries?.length) return
  return (
    <div className="flex flex-col gap-3">
      <Kanjidic2Header length={entries.length} />
      {entries.map((entry, idx) => (
        <div key={idx} className="flex flex-col justify-between gap-5">
          <div
            className="flex flex-col gap-4"
          >
            <Kanjidic2Misc misc={entry.misc} />
            <div
              className="grid grid-cols-12 gap-4"
            >
              <div className="col-span-2">
                <Kanjidic2Literal 
                  literal={entry.literal}
                  definition={entry.readingMeaning?.groups[0].meanings[0].value || ""}
                  sentences={{
                    kanji: sentences.kanji,
                    english: sentences.english
                  }}
                />
              </div>
              {entry.readingMeaning?.groups.map((g, idx) => (
                <div 
                  key={idx}
                  className="col-span-10 flex flex-col gap-5"
                >
                  <div className="flex flex-row gap-1 flex-wrap">
                    {g.meanings.map((m, idx) => (
                      <div key={idx} className="flex flex-row gap-0">
                        <Kanjidic2Meaning key={idx} meaning={m} />
                        {idx < g.meanings.length - 1 && <DotSeparator />}
                      </div>
                    ))}
                  </div>
                  <Kanjidic2Reading reading={g.readings} />
                </div>
              ))}
            </div>
          </div>
          {idx < entries.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}