import { definitionQueries } from "@/lib/queries/definition";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { useQuery } from "@tanstack/react-query";

type UseDefinitionHookProps = {
  query?: string
}

export function useDefinitionHook({
  query
}: UseDefinitionHookProps) {
  const setDefinition = useDefinitionStore((state) => state.setDefinition)

  const { data: entries, isLoading, error } = useQuery({
    ...definitionQueries.definition(query || "", setDefinition),
    enabled: !!query
  })

  return {
    isLoading,
    entries,
    error
  };
}