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
  const { data: jmdictEntries, isLoading: isJMdictLoading, error: jMdictError } = useQuery({
    ...definitionQueries.jmdict(query || ""),
    enabled: !!query && !isExpanded
  })

  const { data: dictionary, isLoading: isDictionaryLoading, error: dictionaryError } = useQuery({
    ...definitionQueries.dictionary(query || ""),
    enabled: !!query && !!isExpanded
  })

  return {
    dictionary: isExpanded ? dictionary : null,
    entries: isExpanded ? null : jmdictEntries,
    isLoading: isExpanded ? isDictionaryLoading : isJMdictLoading,
    error: isExpanded ? dictionaryError : jMdictError
  };
}