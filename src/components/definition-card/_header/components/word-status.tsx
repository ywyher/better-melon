import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { wordStatuses } from "@/lib/constants/word";
import { Word } from "@/lib/db/schema";
import { useWordStatus } from "@/lib/hooks/use-word-status";
import { BookType } from "lucide-react";

export default function DefinitionCardHeaderWordStatus({ word }: { word: string }) {
  const { 
    handler,
    isLoading,
    status
  } = useWordStatus({ word })
  
  return (
    <Select
      onValueChange={async (v: Word['status']) => await handler(word, v)}
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