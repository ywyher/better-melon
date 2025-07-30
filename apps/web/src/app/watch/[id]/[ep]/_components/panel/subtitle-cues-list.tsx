import { TabsContent } from "@/components/ui/tabs";
import { SubtitleCue as TSubtitleCue, SubtitleTranscription } from "@/types/subtitle";
import SubtitleCue from "@/app/watch/[id]/[ep]/_components/panel/subtitle-cue";
import { useSubtitleCuesList } from "@/lib/hooks/use-subtitle-cues-list";

type SubtitleCuesListProps = {
  isLoading: boolean;
  selectedTranscription: SubtitleTranscription;
  cues: TSubtitleCue[];
  japaneseCues?: TSubtitleCue[];
}

export default function SubtitleCuesList({
  selectedTranscription,
  isLoading,
  cues,
  japaneseCues
}: SubtitleCuesListProps) {
  const { activeCueIdRef, handleManualScroll, rowVirtualizer, scrollAreaRef } = useSubtitleCuesList({
    cues,
    selectedTranscription
  })
    
  return (
    <div 
      ref={scrollAreaRef} 
      className="overflow-y-auto h-[80vh] w-full"
      style={{
        opacity: isLoading ? 0.8 : 1,
      }}
      onScroll={handleManualScroll}
    >
      <TabsContent 
        value={selectedTranscription}
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >   
          <>
            {rowVirtualizer.getVirtualItems().map((row) => {
              const cue = cues[row.index];
              const japaneseCue = japaneseCues?.[row.index]

              if (!cue) return null;
              
              return (
                <SubtitleCue
                  key={`${selectedTranscription}-${row.key}-${cue.id}`}
                  cue={cue}
                  japaneseCue={japaneseCue}
                  index={row.index}
                  isActive={activeCueIdRef.current === cue.id}
                  size={row.size}
                  start={row.start}
                />
              );
            })}
          </>
      </TabsContent>
    </div>
  )
}