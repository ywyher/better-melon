import { getWord } from "@/app/settings/word/_known-words/actions";
import { Word } from "@/lib/db/schema";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const wordQueries = createQueryKeys('anime', {
    word: (word: string, status?: Word['status']) => ({
      queryKey: ['word', word, status],
      queryFn: async () => await getWord(word)
    }),
})