import { Word } from "@/lib/db/schema";
import { CSSProperties } from "react";

export const wordStatuses = ['known', 'learning', 'unknown', 'ignore'] as Word['status'][]

export const wordStatusesColors = {
  unknown: "red",
  learning: "orange",
  known: "green",
  ignore: "gray"
}

export const learningStatusesStyles: {
  unknown: CSSProperties
  known: CSSProperties
  learning: CSSProperties
  ignore: CSSProperties
} = {
  unknown: {
    borderBottom: '2px red solid',
  },
  learning: {
    borderBottom: '2px orange solid',
  },
  known: {
    borderBottom: '2px green solid',
  },
  ignore: {
    borderBottom: '2px gray solid',
  },
}