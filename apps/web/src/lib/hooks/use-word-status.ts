import { handleWord } from "@/app/settings/word/_known-words/actions";
import { Word } from "@/lib/db/schema";
import { wordQueries } from "@/lib/queries/word";
import { useLearningStore } from "@/lib/stores/learning-store";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type WordStatusProps = {
  word: string
}

export function useWordStatus({
  word
}: WordStatusProps) {
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<Word['status'] | undefined>(undefined)
  const wordsLookup = useLearningStore((state) => state.wordsLookup)
  const setWordsLookup = useLearningStore((state) => state.setWordsLookup)

  const { data: wordData, isLoading: isWordDataLoading } = useQuery(wordQueries.word(word, newStatus))

  const handler = async (word: string, status: Word['status']) => {
    try {
      setIsActionLoading(true)

      const { error, message } = await handleWord({ word, status })
      if(error) throw new Error(error);

      if(wordsLookup) {
        const newWordsLookup = new Map(wordsLookup);
        const exists = newWordsLookup.get(word);
        
        if(exists) {
          newWordsLookup.set(word, { word: exists.word, status });
        } else {
          newWordsLookup.set(word, { word, status });
        }
        
        setWordsLookup(newWordsLookup);
      }

      setNewStatus(status)
      toast.success(message)
    } catch(error) {
      const err = error instanceof Error ? error.message : 'Failed to set word status'
      toast.error(err)
    } finally {
      setIsActionLoading(false)
    }
  }

  return {
    status: wordData?.word?.status,
    isLoading: isActionLoading || isWordDataLoading,
    handler,
  }
}