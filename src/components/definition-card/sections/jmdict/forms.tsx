import DotSeparator from "@/components/dot-separator"
import { JMdictKana, JMdictKanji } from "@/types/jmdict"
import { Fragment } from "react"

type JMdictFormsProps = {
  kanji?: JMdictKanji[]
  kana?: JMdictKana[]
}

export default function JMdictForms({ kanji, kana }: JMdictFormsProps) {
  const filteredKanji = kanji?.filter(k => !k.tags.includes('sK')) || []
  const filteredKana = kana?.filter(k => !k.tags.includes('sK')) || []
  
  const allForms = [...filteredKanji, ...filteredKana]
  
  if (allForms.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 font-medium">Other forms</p>
      <div className="flex flex-wrap items-center gap-2">
        {allForms.map((form, index) => (
          <Fragment key={`form-${index}`}>
            <span className="text-gray-300 font-medium">{form.text}</span>
            {index < allForms.length - 1 && <DotSeparator />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}