import { Button } from "@/components/ui/button";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { Expand, Shrink } from "lucide-react";

export default function DefinitionCardHeaderExpand() {
  const player = usePlayerStore((state) => state.player)
  const setPosition  = useDefinitionStore((state) => state.setPosition)
  const setIsExpanded  = useDefinitionStore((state) => state.setIsExpanded)
  const isExpanded  = useDefinitionStore((state) => state.isExpanded)

  const handleExpand = () => {
    if(!isExpanded) {
      setIsExpanded(true)
      setPosition({ x: 0, y: 0 })

      if(player.current) {
        player.current.pause()
      } 
    }else {
      setIsExpanded(false)
    }
  }

  return (
    <Button
      className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
      onClick={() => handleExpand()} 
    >
      {isExpanded ? <Shrink /> : <Expand />}
    </Button>
  )
}