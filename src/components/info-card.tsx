import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invokeAnkiConnect } from "@/lib/anki";
import { AnkiPreset, useAnkiPresetStore } from "@/lib/stores/anki-presets-store";
import { useInfoCardStore } from "@/lib/stores/info-card-store";
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
import { useWatchStore } from '@/app/watch/[id]/[ep]/store';
import { takeSnapshot } from '@/lib/funcs';

export default function InfoCard() {
  const getDefaultPreset = useAnkiPresetStore((state) => state.getDefaultPreset)
  const { sentance, setSentance, setToken, token } = useInfoCardStore()
  const setActiveTokenId = useWatchStore((state) => state.setActiveTokenId)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const player = useWatchStore((state) => state.player);
  
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
    const preset = getDefaultPreset() as AnkiPreset
  
    if(!preset || !token || !sentance) {
      toast.warning("Setup anki configurations thorugh /profile/settings")
      return;
    }
  
    const noteFields = preset.fields.filter(f => f.value).map((f) => {
      return {
        [f.name]: f.value == "expression" ? token.surface_form : (f.value == 'sentance' ? sentance : "")
      }
    })
    

    const noteOptions = {
      "note": {
        "deckName": preset.deckName,
        "modelName": preset.modelName,
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
        "picture": (preset.fields.find(p => p.value == 'image') && player.current) ? [
          {
            "data": takeSnapshot(player.current), // This is the key change - use "data" instead of "url"
            "filename": `frame_${Date.now()}.png`,
            "fields": [
              "Image" // Make sure this matches your Anki note type's image field name
            ]
          }
        ] : undefined
      }
    };
    
    const { error } = await invokeAnkiConnect(preset.isGui ? 'guiAddCards' : 'addNote', 6, noteOptions)
  
    if(error) {
      console.log(error)
      toast.error('Please follow the instruction on the /profile/settings page to get this feature working properly')
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
      id: 'info-card',
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