'use client'

import { useQuery } from '@tanstack/react-query'
import { invokeAnkiConnect } from '@/lib/anki'
import AnkiSkeleton from '@/app/settings/anki/_components/anki-skeleton'
import AnkiError from '@/app/settings/anki/_components/anki-error'
import AnkiPreset from '@/app/settings/anki/_components/anki-preset'

export default function AnkiSettingsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['anki-connection'],
    queryFn: async () => await invokeAnkiConnect('deckNames', 6),
    retry: 3,
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return <AnkiSkeleton />
  }

  return (
    <div className='pt-4'>
      {(error?.message || !data?.data) ? (
        <AnkiError />
      ) : (
        <AnkiPreset />
      )}
    </div>
  )
}