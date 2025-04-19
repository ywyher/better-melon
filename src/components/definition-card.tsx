"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invokeAnkiConnect } from "@/lib/anki";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { X } from "lucide-react";
import { toast } from "sonner";
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMediaStore } from '@/lib/stores/media-store';
import { takeSnapshot } from '@/lib/funcs';
import { useQuery } from '@tanstack/react-query';
import { AnkiPreset } from '@/lib/db/schema';
import { getDefaultPreset } from '@/app/settings/anki/actions';

export default function DefinitionCard() {
  const { sentance, setSentance, setToken, token } = useDefinitionStore()
  const setActiveTokenId = useMediaStore((state) => state.setActiveTokenId)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const player = useMediaStore((state) => state.player);

  const { data: preset } = useQuery({
    queryKey: ['anki', 'preset'],
    queryFn: async () => {
      return await getDefaultPreset() as AnkiPreset || null
    }
  })
  useEffect(() =>{ 
    if(!preset) return;
    console.log(preset)
    Object.entries(preset?.fields).map(([field,value]) => {
      console.log(`field`, field)
      console.log(`value`, value)
    })
  }, [preset])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition({
      x: position.x + delta.x,
      y: position.y + delta.y,
    });
  };

  const handleAddNote = async () => {
    if(!preset || !token || !sentance) {
      toast.warning("Setup anki configurations thorugh /profile/settings")
      return;
    }
  
    const noteFields = Object.entries(preset.fields)
    .filter(([_, value]) => value)
    .map(([key, value]) => {
      return {
        [key]: value === "expression"
          ? token.surface_form
          : value === "sentance"
          ? sentance
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
        "picture": (Object.entries(preset.fields).find(([_,value]) => value == 'image') && player.current) ? [
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

  const handleClose = () => {
    setSentance(null)
    setToken(null)
    setActiveTokenId(null)
  }

  function FloatingCard() {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: 'definition-card',
    });
    
    const style = transform ? {
      transform: `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`,
    } : {
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    };

    return (
      <Card
        ref={setNodeRef} 
        style={style}
        className="
          absolute top-5 left-1/2 
          -translate-x-1/2
          z-20
          flex flex-col gap-5
          min-w-[300px]
          p-3
          cursor-move
          shadow-lg
        "
        {...listeners}
        {...attributes}
      >
        <CardHeader className="flex flex-row justify-between items-center p-0">
          <CardTitle>{token?.surface_form}</CardTitle>
          <Button
            className="cursor-pointer z-20 rounded-full p-1 w-7 h-7 m-1"
            onClick={() => handleClose()} 
            variant='destructive'
          >
            <X />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Button
            className="w-full"
            onClick={() => handleAddNote()}
          >
          Add to anki
          </Button>
        </CardContent>
      </Card>
    )
  }

  if(!sentance || !token) return null;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <FloatingCard />
    </DndContext>
  );
}