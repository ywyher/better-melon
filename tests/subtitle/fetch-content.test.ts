// shit ass

import { fetchSubtitleContent } from '@/lib/subtitle/parse'
import { expect, test } from 'vitest'

test('Fetch subtitle content', async () => {
  const content = await fetchSubtitleContent({
    isFile: false,
    transcription: 'japanese',
    source: "https://jimaku.cc/entry/1323/download/%5BMoozzi2%5D%20Made%20in%20Abyss%20-%2009%20(BD%201920x1080%20x.264%20Flac).ass"
  })
  
  expect(content).not.toBeNull()
})