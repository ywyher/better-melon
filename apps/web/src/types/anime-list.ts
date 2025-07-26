import { ComponentType, SVGProps } from "react"

export type AnimeListProivders = 'anilist'

export type AnimeListProivder = {
  name: AnimeListProivders
  icon: ComponentType<SVGProps<SVGSVGElement>>
}