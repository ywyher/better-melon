'use client'
import { usePathname } from 'next/navigation'

function getSettingsTitle(pathname: string): string {
  const segment = pathname.split('/').pop()
  
  const titleMap: Record<string, string> = {
    'settings': 'General Settings',
    'word': 'Words Settings',
    'player': 'Player Settings', 
    'subtitle': 'Subtitle Settings',
    'anki': 'Anki Settings',
    'anime-lists': 'Anime lists Settings',
  }
  
  return titleMap[segment || ''] || 'Settings'
}

export default function SettingsTitle() {
  const pathname = usePathname()

  return (
    <p className="font-bold text-3xl text-neutral-800 dark:text-neutral-100">
      {getSettingsTitle(pathname)}
    </p>
  )
}