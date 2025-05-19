import { GeneralSettings } from "@/lib/db/schema"

export const vttEn = "https://s.megastatics.com/subtitle/6422ef1d64b31a672f041ef180be0c1b/6422ef1d64b31a672f041ef180be0c1b.vtt"
export const srtJp = "https://jimaku.cc/entry/2184/download/%5BAC%5D%20Boku%20dake%20ga%20Inai%20Machi%20-%2004%20%5B720p%5D%5BLucifer22%5D%5BCrunchyroll%20Timed%5D.ja.srt" 
export const srtEn = "https://gist.githubusercontent.com/matibzurovski/d690d5c14acbaa399e7f0829f9d6888e/raw/63578ca30e7430be1fa4942d4d8dd599f78151c7/example.srt" 

export const syncStrategies: GeneralSettings['syncPlayerSettings'][] = [
  'ask',
  'always',
  'never'
]