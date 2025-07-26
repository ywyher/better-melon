import { Button } from "@/components/ui/button";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { X } from "lucide-react";

export default function DefinitionCardHeaderClose() {
  const setIsExpanded  = useDefinitionStore((state) => state.setIsExpanded)
  const setSentences  = useDefinitionStore((state) => state.setSentences)
  const setToken  = useDefinitionStore((state) => state.setToken)

  const handleClose = () => {
    setSentences({
      kanji: null,
      kana: null,
      english: null,
    })
    setIsExpanded(false)
    setToken(null)
  }

  return (
    <Button
      className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
      onClick={() => handleClose()} 
      variant='destructive'
      >
      <X />
    </Button>
  )
}