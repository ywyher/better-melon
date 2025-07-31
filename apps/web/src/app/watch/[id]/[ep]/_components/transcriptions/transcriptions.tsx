'use client'

import { TranscriptionItem } from "@/app/watch/[id]/[ep]/_components/transcriptions/transcription-item";
import { usePlayerStore } from "@/lib/stores/player-store";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo, useCallback, useMemo } from "react";
import { useActiveSubtitles } from "@/lib/hooks/use-active-subtitles";
import { useMediaState } from "@vidstack/react";
import { useTranscriptionOrder } from "@/lib/hooks/use-transcriptions-order";
import useAutoPause from "@/lib/hooks/use-auto-pause";
import { useTranscriptionStore } from "@/lib/stores/transcription-store";
import { useSettingsStore } from "@/lib/stores/settings-store";

const SubtitleTranscriptions = memo(function SubtitleTranscriptions() {
  const player = usePlayerStore((state) => state.player);

  const transcriptionsStyles = useTranscriptionStore((state) => state.transcriptionsStyles)
  const transcriptions = useTranscriptionStore((state) => state.transcriptions)

  const subtitleSettings = useSettingsStore((settings) => settings.subtitle)
  const syncSettings = useSettingsStore((settings) => settings.general.syncSettings)

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
    subtitleSettings: subtitleSettings,
    syncSettings: syncSettings
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
        transcriptionsStyles[transcription]?.tokenStyles
        || transcriptionsStyles['all'].tokenStyles;

      const containerStyle = 
        transcriptionsStyles[transcription]?.containerStyle
        || transcriptionsStyles["all"].containerStyle;

      // Get furigana styles for ruby text
      const furiganaStyles = {
        tokenStyles: transcriptionsStyles['furigana']?.tokenStyles || transcriptionsStyles['all'].tokenStyles,
        containerStyle: transcriptionsStyles['furigana']?.containerStyle || transcriptionsStyles['all'].containerStyle
      };

      return {
        transcription,
        tokenStyles,
        containerStyle,
        furiganaStyles,
      };
    }).filter(Boolean);
  }, [order, activeSubtitles, transcriptionsStyles]);

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
});

export default SubtitleTranscriptions;