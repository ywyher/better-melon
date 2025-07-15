'use client'

import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import { usePlayerStore } from "@/lib/stores/player-store";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useMemo } from "react";
import { useWatchDataStore } from "@/lib/stores/watch-store";
import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { useMediaState } from "@vidstack/react";
import { useTranscriptionOrder } from "@/lib/hooks/use-transcriptions-order";
import useAutoPause from "@/lib/hooks/use-auto-pause";

export default function SubtitleTranscriptions() {
  const player = usePlayerStore((state) => state.player);

  const styles = useWatchDataStore((state) => state.styles)
  const settings = useWatchDataStore((state) => state.settings)
  const transcriptions = useWatchDataStore((state) => state.transcriptions)
  const {
    activeSubtitles
  } = useActiveSubtitles(transcriptions || [])

  const isFullscreen = useMediaState('fullscreen', player);
  const controlsVisible = useMediaState('controlsVisible', player);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { handleDragEnd, order } = useTranscriptionOrder({
    subtitleSettings: settings.subtitleSettings,
    syncSettings: settings.generalSettings.syncSettings
  })

  useAutoPause({ activeSubtitles })

  const getBottomPosition = useCallback(() => {
    if (isFullscreen) {
        return controlsVisible ? '5' : '2';
    }
    return controlsVisible ? '4' : '1';
  }, [isFullscreen, controlsVisible]);

  const wrapperStyles = useMemo(() => ({
    transition: 'bottom 0.3s ease',
    height: 'fit-content',
    bottom: `${getBottomPosition()}rem`
  }), [getBottomPosition]);

  const transcriptionsWithStyles = useMemo(() => {
    return order.map(transcription => {
      if (!activeSubtitles?.[transcription]?.length) return null;

      const tokenStyles =
        styles[transcription]?.tokenStyles
        || styles['all'].tokenStyles;

      const containerStyle = 
        styles[transcription]?.containerStyle
        || styles["all"].containerStyle;

      // Get furigana styles for ruby text
      const furiganaStyles = {
        tokenStyles: styles['furigana']?.tokenStyles || styles['all'].tokenStyles,
        containerStyle: styles['furigana']?.containerStyle || styles['all'].containerStyle
      };

      return {
        transcription,
        tokenStyles,
        containerStyle,
        furiganaStyles,
      };
    }).filter(Boolean);
  }, [order, activeSubtitles, styles]);

  return (
    <div
      className="absolute left-1/2 transform -translate-x-1/2 flex items-center flex-col w-[100%]"
      style={wrapperStyles}
    >
      <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
      >
          <SortableContext 
              items={order}
              strategy={verticalListSortingStrategy}
          >
              {transcriptionsWithStyles.map((t) => {
                if(!t) return;
                return (
                  <TranscriptionItem
                    key={t.transcription}
                    transcription={t.transcription}
                    furiganaStyles={t.furiganaStyles}
                    activeSubtitles={activeSubtitles}
                    styles={{
                      tokenStyles: t.tokenStyles,
                      containerStyle: t.containerStyle
                    }}
                  />
                );
              })}
          </SortableContext>
      </DndContext>
    </div>
  );
}