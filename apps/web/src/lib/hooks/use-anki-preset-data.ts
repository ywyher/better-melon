import { useQuery } from "@tanstack/react-query"
import { ankiQueries } from "@/lib/queries/anki"

export function useAnkiData(selectedModel: string) {
  const { data: deckNames, isLoading: isDeckNamesLoading } = useQuery({ 
    ...ankiQueries.deckNames() 
  })
  
  const { data: modelNames, isLoading: isModelNamesLoading } = useQuery({ 
    ...ankiQueries.modelNames() 
  })
  
  const { data: modelFieldNames, isLoading: isModelFieldNamesLoading } = useQuery({
    ...ankiQueries.modelFieldNames(selectedModel),
    enabled: !!selectedModel
  })

  const isLoading = isDeckNamesLoading || isModelNamesLoading
  const hasData = deckNames && modelNames

  return {
    deckNames,
    modelNames,
    modelFieldNames,
    isModelFieldNamesLoading,
    isLoading,
    hasData
  }
}