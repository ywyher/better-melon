import { getDictionaryEntries, getJMdictEntries } from "@/components/definition-card/actions";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const definitionQueries = createQueryKeys('definition', {
    jmdict: (query: string) => ({
        queryKey: ['definition', 'jmdict', query],
        queryFn: async () => {
          const { index, entries } = await getJMdictEntries(query)

          return {
            index,
            entries
          }
        },
    }),
    dictionary: (query: string) => ({
        queryKey: ['definition', 'dictionary', query],
        queryFn: async () => {
          const data = await getDictionaryEntries(query)

          return data
        },
    }),
})