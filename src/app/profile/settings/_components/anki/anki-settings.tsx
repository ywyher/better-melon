'use client'

import { useQuery } from '@tanstack/react-query'
import AnkiError from "./anki-error"
import AnkiPreset from "./anki-preset"
import { invokeAnkiConnect } from '@/lib/anki'

export default function AnkiSettings() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['ankiConnection'],
    queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return <div>Checking Anki connection...</div>
  }

  return (
    <>
      {(error?.message || !data?.data) ? (
        <AnkiError />
      ) : (
        <AnkiPreset />
      )}
    </>
  )
}