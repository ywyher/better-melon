import { getJMdictEntries } from "@/components/definition-card/actions";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { JMdictWord } from "@scriptin/jmdict-simplified-types";

export const definitionQueries = createQueryKeys('definition', {
    definition: (query: string, setDefinition: (defintion: string) => void) => ({
        queryKey: ['definition', query],
        queryFn: async () => {
          const entries = await getJMdictEntries(query)

          setDefinition(entries[0].sense[0].gloss[0].text || "Nothing found")
          return entries as JMdictWord[]
        },
    }),
})