import JMdictCharacter from "@/components/definition-card/sections/jmdict/character"
import JMdictForms from "@/components/definition-card/sections/jmdict/forms"
import JMdictMeaning from "@/components/definition-card/sections/jmdict/gloss"
import { Separator } from "@/components/ui/separator"
import { JMdictWord } from "@scriptin/jmdict-simplified-types"
import { Dot } from "lucide-react"

type JMdictSectionProps = {
  entries: JMdictWord[]
}

export default function JMdictSection({ entries }: JMdictSectionProps) {
  if (!entries?.length) return null

  return (
    <div className="flex flex-col gap-5">
      {entries.map((entry) => (
        <div className="flex flex-col justify-between gap-5">
          <div className="px-3">
            {/* Main character display */}
            <div className="mb-4">
              <JMdictCharacter character={entry.kanji[0] || entry.kana[0]} />
            </div>
            
            {/* Content grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Forms section */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3">
                <JMdictForms kana={entry.kana} kanji={entry.kanji} />
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
                              gloss={gloss}
                              append={
                                glossIdx < sense.gloss.length - 1 ? (
                                  <span className="text-gray-400 mx-1"><Dot /></span>
                                ) : null
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
          <Separator />
        </div>
      ))}
    </div>
  )
}