import JMnedictHeader from "@/components/definition-card/_sections/jmnedict/header"
import JMnedictName from "@/components/definition-card/_sections/jmnedict/name"
import JMnedictTranslation from "@/components/definition-card/_sections/jmnedict/translation"
import DotSeparator from "@/components/dot-separator"
import { Separator } from "@/components/ui/separator"
import { JMnedictWord } from "@/types/jmnedict"

type JMnedictProps = {
  entries: JMnedictWord[]
}

export default function JMnedictSection({ entries }: JMnedictProps) {
  if(!entries?.length) return
  return (
    <div className="flex flex-col gap-3">
      <JMnedictHeader length={entries.length} />
      {entries.map((entry, entryIdx) => (
        <div key={entryIdx} className="flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            <JMnedictName
              kanji={entry.kanji[0]}
              kana={entry.kana[0]}
              translation={entry.translation[0].translation[0]}
            />
            <div className="flex flex-row gap-1 flex-wrap">
              {entry.translation.flatMap((t, tIdx) => 
                t.translation.map((tt, ttIdx) => {
                  const isLast = tIdx === entry.translation.length - 1 && 
                                ttIdx === t.translation.length - 1;
                  return (
                    <div key={`${tIdx}-${ttIdx}`} className="flex flex-row gap-0">
                      <JMnedictTranslation translation={tt} />
                      {!isLast && <DotSeparator />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {entryIdx < entries.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}