import { definitionQueries } from "@/lib/queries/definition";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import type { JMdictWord } from "@/types/jmdict";
import { useQuery } from "@tanstack/react-query";

type useDefinitionProps = {
  isExpanded: boolean
  query?: string
}

export function useDefinition({
  isExpanded,
  query
}: useDefinitionProps) {
  const setDefinition = useDefinitionStore((state) => state.setDefinition)

  const { data: jmdict, isLoading: isJMdictLoading, error: jMdictError } = useQuery({
    ...definitionQueries.jmdict(query || "", setDefinition),
    enabled: !!query && !isExpanded
  })

  const { data: dictionary, isLoading: isDictionaryLoading, error: dictionaryError } = useQuery({
    ...definitionQueries.dictionary(query || ""),
    enabled: !!query && !!isExpanded
  })

  return {
    isLoading: isExpanded ? isDictionaryLoading : isJMdictLoading,
    dictionary: isExpanded ? dictionary : null,
    entries: isExpanded ? null : jmdict?.entries as JMdictWord[],
    isFuzzy: isExpanded ? false : jmdict?.isFuzzy,
    error: isExpanded ? dictionaryError : jMdictError
  };
}