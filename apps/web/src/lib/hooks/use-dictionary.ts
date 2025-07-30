import { definitionQueries } from "@/lib/queries/definition";
import { useQuery } from "@tanstack/react-query";

type useDefinitionProps = {
  query?: string
}

export function useDictionary({
  query
}: useDefinitionProps) {
  const { data: dictionary, isLoading: isDictionaryLoading, error: dictionaryError } = useQuery({
    ...definitionQueries.dictionary(query || ""),
    enabled: !!query
  })

  return {
    dictionary: dictionary,
    isLoading: isDictionaryLoading,
    error: dictionaryError
  };
}