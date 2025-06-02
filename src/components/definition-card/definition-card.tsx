"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { usePlayerStore } from '@/lib/stores/player-store';
import { takeSnapshot } from '@/lib/anki';
import { useQuery } from '@tanstack/react-query';
import { ankiQueries } from '@/lib/queries/anki';
import DefinitionCardContent from '@/components/definition-card/definition-card-content';

export default function DefinitionCard() {
  const { sentence, setSentence, setToken, token, addToAnki, definition } = useDefinitionStore()
  const setActiveTokenId = usePlayerStore((state) => state.setActiveTokenId)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const player = usePlayerStore((state) => state.player);

  const { data: preset } = useQuery(ankiQueries.defaultPreset())

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
  }

  const handleAddNote = async () => {
    if(!preset || !token || !sentence) {
      toast.warning("Setup anki configurations thorugh /profile/settings")
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

  const handleClose = () => {
    setSentence(null)
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
          z-50
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
        <DefinitionCardContent query={token?.surface_form}  />
        {addToAnki && (
          <CardFooter className="p-0">
            <Button
              className="w-full"
              onClick={() => handleAddNote()}
            >
              Add to anki
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }

  if(!sentence || !token) return null;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <FloatingCard />
    </DndContext>
  );
}