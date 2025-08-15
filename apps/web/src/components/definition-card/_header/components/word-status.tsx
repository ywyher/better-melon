import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { wordStatuses } from "@/lib/constants/word";
import { Word } from "@/lib/db/schema";
import { useWord } from "@/lib/hooks/use-word";
import { BookType } from "lucide-react";

export default function DefinitionCardHeaderWordStatus({ word }: { word: string }) {
  const { 
    saveWord,
    isLoading,
    status
  } = useWord({ word })
  
  return (
    <Select
      onValueChange={async (v: Word['status']) => await saveWord(word, v)}
      disabled={isLoading}
      value={status}
    >
      <SelectTrigger
        className="cursor-pointer rounded-full"
        size="none"
      >
        <BookType className="w-5 h-5" />
      </SelectTrigger>
      <SelectContent>
        {wordStatuses.map(s => (
          <SelectItem 
            key={s}
            value={s}
            className="capitalize"
          >
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}