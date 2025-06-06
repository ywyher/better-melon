import { Separator } from "@/components/ui/separator"
import { JMnedictWord } from "@/types/jmnedict"

type JMnedictProps = {
  entries: JMnedictWord[]
}

export default function JMnedictSection({ entries }: JMnedictProps) {
  if(!entries?.length) return
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, idx) => (
        <div key={idx} className="flex flex-col justify-between gap-5">
          <div
            className="flex flex-col gap-4"
          >
            <div
              className="grid grid-cols-12 gap-4"
            >
              <div className="col-span-2">
              </div>

            </div>
          </div>
          {idx < entries.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}