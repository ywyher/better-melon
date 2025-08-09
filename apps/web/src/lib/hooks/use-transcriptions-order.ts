import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/components/multiple-selector";
import { handleTranscriptionOrder } from "@/app/settings/subtitle/_transcription-order/actions";
import { useMutation } from "@tanstack/react-query";
import { useSyncSettings } from "@/lib/hooks/use-sync-settings";
import { settingsQueries } from "@/lib/queries/settings";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import { GeneralSettings, SubtitleSettings } from "@/lib/db/schema";
import type { DragEndEvent } from "@dnd-kit/core";
import type { SubtitleTranscription } from "@/types/subtitle";

type UseTranscriptionOrderProps = {
  subtitleSettings: SubtitleSettings,
  syncSettings: GeneralSettings['syncSettings']
}

export function useTranscriptionOrder({
  subtitleSettings,
  syncSettings
}: UseTranscriptionOrderProps) {
  const [order, setOrder] = useState<SubtitleTranscription[]>(() => [...subtitleSettings.transcriptionOrder]);
  const debouncedOrder = useDebounce<SubtitleTranscription[]>(order, 1500);
  const hasUserDragged = useRef(false);

  const { handleSync } = useSyncSettings({
    syncSettings,
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error),
    invalidateQueries: [settingsQueries.subtitle._def]
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      await handleSync({
        serverOperation: () => handleTranscriptionOrder({ 
          transcriptions: debouncedOrder 
        }),
        successMessage: "Transcription order updated successfully"
      });
      
      hasUserDragged.current = false;
    }
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const {active, over} = event;
    
    if(!active || !over || active.id === over.id) return;
    
    hasUserDragged.current = true;
            
    setOrder(currentOrder => {
      const oldIndex = currentOrder.indexOf(active.id.toString() as SubtitleTranscription);
      const newIndex = currentOrder.indexOf(over.id.toString() as SubtitleTranscription);
      
      return arrayMove(currentOrder, oldIndex, newIndex);
    });
  }, []);

  // Auto-save when order changes
  useEffect(() => {
    const shouldTriggerUpdate = 
      debouncedOrder.length > 0 && 
      hasUserDragged.current;
    
    if (shouldTriggerUpdate) {
      mutate();
    }
  }, [debouncedOrder, mutate]);

  return {
    order,
    handleDragEnd
  };
}