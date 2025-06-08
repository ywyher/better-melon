import SubtitlePanel from "@/app/watch/[id]/[ep]/_components/panel/panel";
import SettingsDialog from "@/app/watch/[id]/[ep]/_components/settings/settings-dialog";
import { TranscriptionQuery, TranscriptionsLookup } from "@/app/watch/[id]/[ep]/types";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { PlayerStore, usePlayerStore } from "@/lib/stores/player-store";
import { AnimeEpisodeData } from "@/types/anime";
import { SettingsForEpisode } from "@/types/settings";
import { SubtitleCue } from "@/types/subtitle";
import { Captions, Loader2, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

type TopControlsProps = {
  isLoading: boolean;
  loadingDuration: number;
  episodeData?: AnimeEpisodeData;
  isMedium: boolean;
  panelState: PlayerStore['panelState'];
  setPanelState: (state: PlayerStore['panelState']) => void;
  transcriptions: TranscriptionQuery[];
  transcriptionsLookup: TranscriptionsLookup
  settings: SettingsForEpisode
}

export function TopControls({ 
  isLoading,
  loadingDuration,
  episodeData,
  isMedium,
  panelState,
  setPanelState,
  transcriptions,
  transcriptionsLookup,
  settings
}: TopControlsProps) {
  const player = usePlayerStore((state) => state.player)
  return (
    <div className="flex flex-row gap-3 items-center">
      {loadingDuration > 0 && (
        <div className="text-sm text-gray-400">
          Loaded in {(loadingDuration / 1000).toFixed(2)}s
        </div>
      )}
      {/* <Button
        variant='outline'
        onClick={() => {
          player.current?.remoteControl.seek(427)
        }}
      >
        <Search 
          className='animate-spin'
        />
      </Button> */}
      {(isLoading || !episodeData || !transcriptions) ? (
        <div className="flex flex-row gap-2">
          <Button variant='outline'>
            <Loader2 className='animate-spin' />
          </Button>
          {isMedium && (
            <Button variant='outline'>
              <Loader2 className='animate-spin' />
            </Button>
          )}
          {panelState == 'visible' && (
            <Button variant='outline'>
              <Loader2 className='animate-spin' />
            </Button>
          )}
        </div>
      ) : (
        <div className='flex flex-row gap-2'>
          <SettingsDialog 
            generalSettings={settings.generalSettings}
          />
          {isMedium ? (
            <DialogWrapper
              trigger={<Button variant='outline'>
                <Captions />
              </Button>}
              className="overflow-y-auto w-full flex flex-col"
              breakpoint='medium'
            >
              <SubtitlePanel
                subtitleFiles={episodeData.subtitles}
                transcriptions={transcriptions}
                transcriptionsLookup={transcriptionsLookup}
              />
            </DialogWrapper>
          ) : (
            <Button 
              variant='outline'
              onClick={() => setPanelState(panelState == 'hidden' ? 'visible' : 'hidden')}
            >
              {panelState == 'visible' ? (
                <PanelLeftOpen />
              ) : (
                <PanelLeftClose />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}