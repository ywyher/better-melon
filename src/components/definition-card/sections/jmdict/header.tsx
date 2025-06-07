import { Minus } from "lucide-react";

export default function JMdictHeader({ length }: { length: number }) {
  return (
    <div className="flex flex-row gap-1 items-center">
      <h1 className="text-xl">Words</h1>
      <span className="text-gray-500 text-lg"><Minus /></span>
      <span className="text-gray-500 text-lg">{length} found</span>
    </div>
  )
}