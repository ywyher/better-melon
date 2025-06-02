'use client'

import { useDefinitionHook } from "@/lib/hooks/use-definition-hook"

type DefinitionCardContentProps = {
  query?: string
}

export default function DefinitionCardContent({
  query
}: DefinitionCardContentProps) {
  const { entries, isLoading, error } = useDefinitionHook({ query })

  if(error) return <>{error.message || "An error occurd"}</>
  if(isLoading || !entries) return <>Loading...</>

  return (
    <>{entries[0].sense[0].gloss[0].text || "Nothing found"}</>
  )
}