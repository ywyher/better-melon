import { handleWord } from "@/app/settings/word/_known-words/actions";
import { Word } from "@/lib/db/schema";
import { wordQueries } from "@/lib/queries/word";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { useQuery } from "@tanstack/react-query";
import { generateId } from "better-auth";
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
  const wordsLookup = useWatchDataStore((state) => state.wordsLookup)

  const { data: wordData, isLoading: isWordDataLoading } = useQuery(wordQueries.word(word, newStatus))

  const handler = async (word: string, status: Word['status']) => {
    try {
      setIsActionLoading(true)

      const { error, message } = await handleWord({ word, status })
      if(error) throw new Error(error);

      if(wordsLookup) {
        const exists = wordsLookup.get(word)

        if(exists) {
          wordsLookup.set(word, {
            word: exists.word,
            status
          });
        }else {
          wordsLookup.set(word, {
            word,
            status,
          })
        }
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