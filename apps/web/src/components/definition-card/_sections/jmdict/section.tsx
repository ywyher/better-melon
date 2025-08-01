import JMdictKanji from "@/components/definition-card/_sections/jmdict/kanji"
import JMdictForms from "@/components/definition-card/_sections/jmdict/forms"
import JMdictMeaning from "@/components/definition-card/_sections/jmdict/meaning"
import JMdictHeader from "@/components/definition-card/_sections/jmdict/header"
import DotSeparator from "@/components/dot-separator"
import { Separator } from "@/components/ui/separator"
import type { JMdictPos, JMdictWord as TJMdictWord  } from "@/types/jmdict"
import JMdictPitchAccent from "@/components/definition-card/_sections/jmdict/pitch-accent"

type JMdictSectionProps = {
  entries: TJMdictWord[]
}

export default function JMdictSection({ entries }: JMdictSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <JMdictHeader length={entries.length} />
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex flex-col justify-between gap-5">
          <div className="px-3">
            {/* Main character display */}
            <div className="mb-4">
              <JMdictKanji 
                kanji={entry.kanji[0] || entry.kana[0]}
                kana={entry.kana[0]}
                pos={entry.sense[0].partOfSpeech as JMdictPos[]}
                definition={entry.sense[0].gloss[0]}
                sentenceKanji={entry.sense[0].examples.length ? entry.sense[0].examples[0].sentences.find(s => s.land == 'jpn') : undefined}
                sentenceEnglish={entry.sense[0].examples.length ? entry.sense[0].examples[0].sentences.find(s => s.land == 'eng') : undefined}
              />
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-12 gap-6">
              <div className="
                col-span-12 md:col-span-4 lg:col-span-3 
                flex flex-col gap-3
              ">
                {/* Forms section */}
                <JMdictForms kana={entry.kana} kanji={entry.kanji} />
                {entry.kanji.length && <JMdictPitchAccent kanji={entry.kanji} kana={entry.kana} />}
              </div>
              
              {/* Meanings section */}
              <div className="col-span-12 md:col-span-8 lg:col-span-9">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Meanings
                  </h3>
                  <div className="flex flex-col gap-4">
                    {entry.sense.map((sense, senseIdx) => (
                      <div 
                        key={`${entry.id}-sense-${senseIdx}`}
                        className="flex flex-row gap-3"
                      >
                        <p className="text-gray-500">{senseIdx + 1}.</p>
                        <div className="flex flex-row flex-wrap">
                          {sense.gloss.map((gloss, glossIdx) => (
                            <JMdictMeaning
                              key={`${entry.id}-sense-${senseIdx}-gloss-${glossIdx}`} 
                              meaning={gloss}
                              append={
                                glossIdx < sense.gloss.length - 1 && <DotSeparator />
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {idx < entries.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}