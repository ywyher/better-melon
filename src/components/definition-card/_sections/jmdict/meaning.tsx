import { JMdictGloss } from "@/types/jmdict"

type JMdictMeaningProps = {
  meaning: JMdictGloss
  append?: React.ReactNode
}

export default function JMdictMeaning({ meaning, append }: JMdictMeaningProps) {
  return (
    <div className="flex flex-row gap-0">
      <p>{meaning.text}</p>
      {append}
    </div>
  )
}