import SubtitlePanel from "@/app/watch/[id]/[ep]/_components/panel/panel";
import SettingsDialog from "@/app/watch/[id]/[ep]/_components/settings/settings-dialog";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { PlayerStore } from "@/lib/stores/player-store";
import { AnimeEpisodeContext } from "@/types/anime";
import { SubtitleCue } from "@/types/subtitle";
import { Captions, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type TopControlsProps = {
  isLoading: boolean;
  loadingDuration: number;
  episodeContext?: AnimeEpisodeContext;
  isMedium: boolean;
  panelState: PlayerStore['panelState'];
  setPanelState: (state: PlayerStore['panelState']) => void;
  japaneseTranscriptions?: SubtitleCue[]
}

export function TopControls({ 
  isLoading,
  loadingDuration,
  episodeContext,
  isMedium,
  panelState,
  setPanelState,
  japaneseTranscriptions
}: TopControlsProps) {
  return (
    <div className="flex flex-row gap-3 items-center">
      {loadingDuration > 0 && (
        <div className="text-sm text-gray-400">
          Loaded in {(loadingDuration / 1000).toFixed(2)}s
        </div>
      )}
      {(isLoading || !episodeContext || !japaneseTranscriptions) ? (
        <div className="flex flex-row gap-2">
          <Button variant='outline'>
            <Loader2 className='animate-spin' />
          </Button>
          {isMedium && (
            <Button variant='outline'>
              <Loader2 className='animate-spin' />
            </Button>
          )}
          {panelState == 'visable' && (
            <Button variant='outline'>
              <Loader2 className='animate-spin' />
            </Button>
          )}
        </div>
      ) : (
        <div className='flex flex-row gap-2'>
          <SettingsDialog 
            generalSettings={episodeContext.generalSettings}
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
                subtitleFiles={episodeContext.data.subtitles}
                japaneseTranscription={japaneseTranscriptions}
              />
            </DialogWrapper>
          ) : (
            <Button 
              variant='outline'
              onClick={() => setPanelState(panelState == 'hidden' ? 'visable' : 'hidden')}
            >
              {panelState == 'visable' ? (
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