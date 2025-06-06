'use client'

import DefinitionCardContent from "@/components/definition-card/definition-card-content";
import DefinitionCardHeader from "@/components/definition-card/defintion-card-header";
import { Card } from "@/components/ui/card";
import { useDefinition } from "@/lib/hooks/use-definition";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";

export default function DefinitionCardBase() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'definition-card',
  });

  const token = useDefinitionStore((state) => state.token)
  const position = useDefinitionStore((state) => state.position)
  const isExpanded = useDefinitionStore((state) => state.isExpanded)

  const style = transform ? {
    transform: `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`,
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  const { dictionary, entries, isLoading, error } = useDefinition({ query: token?.surface_form, isExpanded })

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
      <DefinitionCardHeader
        entries={entries}
      />
      <DefinitionCardContent
        isExpanded={isExpanded}
        dictionary={dictionary}
        entries={entries}
      />
    </Card>
  )
}