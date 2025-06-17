import { CSSProperties } from "react"

export const pitchAccents = ['heiban', 'atamadaka', 'nakadaka', 'odaka']

export const pitchAccentsStyles: {
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