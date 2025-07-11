import { Index } from "@/types/dictionary"
import { JMdictWord } from "@/types/jmdict"
import { JMnedictWord } from "@/types/jmnedict";
import { Kanjidic2Character } from "@/types/kanjidic2";

export type Definition = {
  index: Index,
  entries: JMdictWord[] | Kanjidic2Character[] | JMnedictWord[];
}