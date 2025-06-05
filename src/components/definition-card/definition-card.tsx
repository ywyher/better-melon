"use client"

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import DefinitionCardBase from '@/components/definition-card/definition-card-base';
import { useDefinitionStore } from '@/lib/stores/definition-store';

export default function DefinitionCard() { 
  const sentence = useDefinitionStore((state) => state.sentence)
  const token = useDefinitionStore((state) => state.token)
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

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

  // if(!sentence || !token) return;

  return (
    <>
      {isExpanded ? (
        <DefinitionCardBase
          position={position}
          setPosition={setPosition}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      ): (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <DefinitionCardBase
            position={position}
            setPosition={setPosition}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </DndContext>
      )}
    </>
  );
}