import { getDictionaryEntries, getJMdictEntries } from "@/components/definition-card/actions";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const definitionQueries = createQueryKeys('definition', {
    jmdict: (query: string, setDefinition: (definition: string) => void) => ({
        queryKey: ['definition', 'jmdict', query],
        queryFn: async () => {
          const { entries, isFuzzy } = await getJMdictEntries(query)

          setDefinition(entries[0]?.sense[0]?.gloss[0]?.text || "Nothing found")
          return {
            entries,
            isFuzzy
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