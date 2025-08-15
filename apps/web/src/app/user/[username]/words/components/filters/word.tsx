import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";

export default function ProfileWordsWordFilter() {
  const [word, setWord] = useQueryState('word')

  return (
    <Input
      name="word"
      onChange={(e) => setWord(e.currentTarget.value)}
      className="w-full"
      placeholder="Search words..."
      defaultValue={word || ""}
    />
  )
}