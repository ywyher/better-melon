'use client'

import { useQuery } from '@tanstack/react-query'
import AnkiError from "./anki-error"
import AnkiPreset from "./anki-preset"
import { invokeAnkiConnect } from '@/lib/anki'
import AnkiSkeleton from '@/app/settings/anki/_components/anki-skeleton'

export default function AnkiSettings() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['ankiConnection'],
    queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    retry: 3,
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return <AnkiSkeleton />
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