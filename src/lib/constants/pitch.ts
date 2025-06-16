import { CSSProperties } from "react"

export const pitch = ['heiban', 'atamadaka', 'nakadaka', 'odaka']

export const pitchStyles: {
  heiban: CSSProperties
  atamadaka: CSSProperties
  nakadaka: CSSProperties
  odaka: CSSProperties
} = {
  heiban: {
    color: "blue"
  },
  atamadaka: {
    color: "red"
  },
  nakadaka: {
    color: "orange"
  },
  odaka: {
    color: "green"
  }
}