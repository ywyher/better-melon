"use client"

import { handleTranscriptionOrder } from '@/app/settings/subtitle/_transcription-order/actions';
import { TranscriptionItem } from '@/app/settings/subtitle/_transcription-order/components/transcription-item';
import TranscriptionOrderSkeleton from '@/app/settings/subtitle/_transcription-order/components/transcription-order-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { settingsQueries } from '@/lib/queries/settings';
import { SubtitleTranscription } from '@/types/subtitle';
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type TranscriptionItemType = {
    id: string;
    text: string;
};

type TranscriptionItems = Record<string, TranscriptionItemType>;

const defaultItems: TranscriptionItems = {
  japanese: {
      id: 'japanese',
      text: "(japanese) 日本語、マジで下手くそです。"
  },
  hiragana: {
      id: 'hiragana',
      text: "(hiragana) にほんご、まじでへたくそです。"
  },
  katakana: {
      id: 'katakana',
      text: "(katakana) ニホンゴ、マジデヘタクソデス。"
  },
  romaji: {
      id: 'romaji',
      text: "(romaji) Nihongo, maji de hetakuso desu. "
  },
  english: {
      id: 'english',
      text: "(english) I'm seriously terrible at Japanese. "
  }
};

export default function TranscriptionOrder() {
  const { data: subtitleSettings, isLoading: isSubtitleSettingsLoading } = useQuery({ ...settingsQueries.subtitle() })

  const [items, setItems] = useState<TranscriptionItems>(defaultItems);
  
  useEffect(() => {
    if (subtitleSettings?.transcriptionOrder && subtitleSettings.transcriptionOrder.length > 0) {
      const orderedItems: TranscriptionItems = {};
      
      subtitleSettings.transcriptionOrder.forEach(id => {
          if (defaultItems[id]) {
              orderedItems[id] = defaultItems[id];
          }
      });
      
      Object.keys(defaultItems).forEach(id => {
          if (!orderedItems[id]) {
              orderedItems[id] = defaultItems[id];
          }
      });
      
      setItems(orderedItems);
    }
  }, [subtitleSettings]);
  
  const itemIds = Object.keys(items);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
      const {active, over} = event;

      if(!active || !over) return;
      if (active.id == over.id) return;

      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      if (oldIndex == -1 && newIndex == -1) return;

      const oldOrder = items;
      const newOrder = arrayMove(itemIds, oldIndex, newIndex);
      
      const newItems: TranscriptionItems = {};
      newOrder.forEach(id => {
          newItems[id] = items[id];
      });

      setItems(newItems);
      const { message, error } = await handleTranscriptionOrder({ transcriptions: Object.keys(newItems) })

      if(error) {
          toast.error(error)
          setItems(oldOrder)
          return
      }

      toast.message(message)
  }
  
  if (isSubtitleSettingsLoading) {
      return <TranscriptionOrderSkeleton />;
  }
  
  return (
      <div className='flex flex-col gap-3 h-[50vh]'>
          <div className="text-xl font-semibold">Transcription Order <i className='text-lg'>(darg and drop)</i></div>
          <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
          >
              <SortableContext
                  items={itemIds}
                  strategy={verticalListSortingStrategy}
              >
                  <Card
                      className="relative flex justify-end h-full pt-0 mt-0 overflow-hidden"
                  >
                      {/* Background Image */}
                      <Image 
                          src="/images/transcription-order-bg.jpg"
                          alt="Background"
                          fill
                          className='object-cover rounded-xl'
                          priority
                      />
                      
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-black/70 z-[1]" />
                      
                      <CardHeader className="z-10"><CardTitle></CardTitle></CardHeader>
                      <CardContent
                          className="flex flex-col justify-center items-center gap-2 z-10"
                      >
                          {itemIds.map(id => (
                              <TranscriptionItem 
                                  key={id} 
                                  transcription={id as SubtitleTranscription} 
                                  text={items[id as SubtitleTranscription].text}
                              />
                          ))}
                      </CardContent>
                  </Card>
              </SortableContext>
          </DndContext>
      </div>
  )
}