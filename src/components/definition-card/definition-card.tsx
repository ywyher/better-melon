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
  const setPosition = useDefinitionStore((state) => state.setPosition)
  const position = useDefinitionStore((state) => state.position)
  const isExpanded = useDefinitionStore((state) => state.isExpanded)
  const token = useDefinitionStore((state) => state.token)
  const sentences = useDefinitionStore((state) => state.sentences)

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

  if(!sentences || !token) return;

  return (
    <>
      {isExpanded ? (
        <DefinitionCardBase />
      ): (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <DefinitionCardBase />
        </DndContext>
      )}
    </>
  );
}