'use client'

import DefinitionCardContent from "@/components/definition-card/definition-card-content";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { invokeAnkiConnect, takeSnapshot } from "@/lib/anki";
import useAddToAnki from "@/lib/hooks/use-add-to-anki";
import { ankiQueries } from "@/lib/queries/anki";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { Expand, Plus, Shrink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type DefinitionCardBaseProps = {
  position: {
    x: number;
    y: number
  },
  setPosition: Dispatch<SetStateAction<DefinitionCardBaseProps['position']>>
  isExpanded: boolean
  setIsExpanded: Dispatch<SetStateAction<DefinitionCardBaseProps['isExpanded']>>
}

export default function DefinitionCardBase({ 
  position,
  setPosition,
  isExpanded,
  setIsExpanded
}: DefinitionCardBaseProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'definition-card',
  });

  const { setSentence, setToken, addToAnki: isAddToAnki, sentence, token, definition } = useDefinitionStore()
  const setActiveTokenId = usePlayerStore((state) => state.setActiveTokenId)
  
  const { addToAnki } = useAddToAnki({ 
    word: token?.surface_form,
    sentence,
    definition
  })
  
  const style = transform ? {
    transform: `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`,
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  const handleExpand = () => {
    if(!isExpanded) {
      setIsExpanded(true)
      setPosition({ x: 0, y: 0 })
    }else {
      setIsExpanded(false)
    }
  }

  const handleClose = () => {
    setSentence(null)
    setToken(null)
    setActiveTokenId(null)
  }

  return (
    <Card
      ref={setNodeRef} 
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex flex-col gap-5 min-w-[300px] p-3 z-50",
        isExpanded ?
          "w-[100%] h-fit"
        :
          "absolute top-5 left-1/2 -translate-x-1/2 cursor-move shadow-lg",
      )}
    >
      <CardHeader className="flex flex-row justify-between items-center p-0">
        <CardTitle>{token?.surface_form}</CardTitle>
        <div className='flex flex-row gap-2'>
          {isAddToAnki && (
            <Button
              className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
              onClick={() => addToAnki()}
            >
              <Plus />
            </Button>
          )}
          <Button
            className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
            onClick={() => handleExpand()} 
          >
            {isExpanded ? <Shrink /> : <Expand />}
          </Button>
          <Button
            className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
            onClick={() => handleClose()} 
            variant='destructive'
            >
            <X />
          </Button>
        </div>
      </CardHeader>
      <DefinitionCardContent
        isExpanded={isExpanded}
        // query={token?.surface_form}
        query={'見る'}
      />
    </Card>
  )
}