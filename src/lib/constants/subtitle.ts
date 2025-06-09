import { SubtitleStyles } from "@/lib/db/schema"

export const subtitleCacheGroup = 'subtitle:'

export const excludedPos = ['数', '記号']
export const subtitleTranscriptions = ['japanese', 'hiragana', 'katakana', 'romaji', 'english', 'furigana'] as const
export const subtitleFormats = [
  "vtt",
  'srt',
  'ass'
]

export const subitlteStylesState: SubtitleStyles['state'][] = ['default', 'active']

export const definitionTrigger = ['click', 'hover']

export const textShadowTypes = [
  "none",
  "drop-shadow",
  "raised",
  "depressed",
  "outline"
] as const;

export const fontWeights = [
  "normal",
  "bold",
  "bolder",
  "lighter",
];

export const fontFamilies = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Lucida Console",
  "Comic Sans MS",
  "Fira Code",
  "JetBrains Mono",
  "Roboto",
  "Open Sans",
  "Inter",
  "Source Sans Pro",
  "Poppins",
  "Lato",
  "Nunito",
  "Montserrat",
]
