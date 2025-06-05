'use client'

import DefinitionCardContent from "@/components/definition-card/definition-card-content";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { invokeAnkiConnect, takeSnapshot } from "@/lib/anki";
import { ankiQueries } from "@/lib/queries/anki";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { Expand, Plus, Shrink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
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
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'definition-card',
  });
  
  const { data: preset } = useQuery(ankiQueries.defaultPreset())
  const { sentence, setSentence, setToken, token, addToAnki, definition } = useDefinitionStore()

  const setActiveTokenId = usePlayerStore((state) => state.setActiveTokenId)
  const player = usePlayerStore((state) => state.player);

  
  const style = transform ? {
    transform: `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`,
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  const handleAddNote = async () => {
    const connection = await invokeAnkiConnect('deckNames', 6)
    if(connection.error) {
      toast.warning("Make sure to open an instance of Anki")
      return
    }

    if(!preset?.fields || !token || !sentence) {
      toast.warning("You have to setup anki configurations.", {
        action: {
          onClick: () => {
            router.push('/settings/anki')
          },
          label: 'Go!'
        }
      })
      return;
    }
  
    const noteFields = Object.entries(preset.fields)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      return {
        [key]: value === "expression"
          ? token.surface_form
          : value === "sentence"
          ? sentence
          : value == 'definition'
          ? definition
          : ""
      };
    });

    const noteOptions = {
      "note": {
        "deckName": preset.deck,
        "modelName": preset.model,
        "fields": noteFields.reduce((acc, obj) => ({ ...acc, ...obj }), {}),
        "options": {
          "allowDuplicate": false,
          "duplicateScope": "deck",
          "duplicateScopeOptions": {
            "deckName": "Default",
            "checkChildren": false,
            "checkAllModels": false
          }
        },
        "tags": [
          "better-melon"
        ],
        "picture": (Object.entries(preset.fields).find(([,value]) => value == 'image') && player.current) ? [
          {
            "data": takeSnapshot(player.current),
            "filename": `frame_${Date.now()}.png`,
            "fields": [
              "Image"
            ]
          }
        ] : undefined
      }
    };

    const { error } = await invokeAnkiConnect(preset.isGui ? 'guiAddCards' : 'addNote', 6, noteOptions)
  
    if(error) {
      toast.error(error)
    } else {
      toast.success("Note created successfully")
    }
  }

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
          {addToAnki && (
            <Button
              className="cursor-pointer z-20 rounded-full p-1 w-7 h-7"
              onClick={() => handleAddNote()}
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
        query={'見る'}
      />
    </Card>
  )
}