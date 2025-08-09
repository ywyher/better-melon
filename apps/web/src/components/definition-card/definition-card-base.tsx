'use client'

import DefinitionCardContent from "@/components/definition-card/definition-card-content";
import DefinitionCardHeader from "@/components/definition-card/_header/definition-card-header";
import { Card } from "@/components/ui/card";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { useDefinitionStore } from "@/lib/stores/definition-store";
import { cn } from "@/lib/utils/utils";
import { useDraggable } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { usePlayerStore } from "@/lib/stores/player-store";

export default function DefinitionCardBase() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'definition-card',
  });

  const player = usePlayerStore((state) => state.player)
  const token = useDefinitionStore((state) => state.token)
  const position = useDefinitionStore((state) => state.position)
  const isExpanded = useDefinitionStore((state) => state.isExpanded)

  const style = transform ? {
    transform: `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`,
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  const { dictionary, isLoading } = useDictionary({ query: token?.original_form })

  if (!token) return;

  const cardContent = (
    <Card
      ref={setNodeRef} 
      style={isExpanded ? undefined : style}
      {...(isExpanded ? {} : listeners)}
      {...(isExpanded ? {} : attributes)}
      className={cn(
        "flex flex-col gap-5 min-w-[300px] p-3 z-50",
        isExpanded ?
          player.current?.state.fullscreen ?
            "fixed top-2 left-1/2 -translate-x-1/2 h-[calc(98vh-var(--header-height))] w-full container mx-auto max-h-none overflow-y-scroll"
            : "fixed top-[var(--header-height)] left-1/2 -translate-x-1/2 h-[calc(98vh-var(--header-height))] w-full container mx-auto max-h-none overflow-y-scroll"
        : "absolute top-5 left-1/2 -translate-x-1/2 cursor-move shadow-lg",
      )}
    >
      <DefinitionCardHeader
        token={token}
        entries={dictionary?.find(d => d.index == 'jmdict')?.entries}
      />
      <DefinitionCardContent
        isExpanded={isExpanded}
        dictionary={dictionary}
        isLoading={isLoading}
      />
    </Card>
  );

  if (isExpanded && typeof document !== 'undefined') {
    if(player?.current?.state.fullscreen && player.current.el) {
      return createPortal(cardContent, player.current.el);
    } else {
      return createPortal(cardContent, document.body);
    }
  }

  return cardContent;
}