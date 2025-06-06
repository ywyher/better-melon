import { JMnedictTranslationTranslation } from "@/types/jmnedict"

type JMnedictTranslationProps = {
  translation: JMnedictTranslationTranslation
}

export default function JMnedictTranslation({ translation }: JMnedictTranslationProps) {
  return (
    <div className="text-xl">{translation.text}</div>
  )
}