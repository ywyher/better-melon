import SubtitlePanel from "@/app/watch/[id]/[ep]/_components/panel/panel";
import SettingsDialog from "@/app/watch/[id]/[ep]/_components/settings/settings-dialog";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { PlayerStore } from "@/lib/stores/player-store";
import { AnimeEpisodeData } from "@/types/anime";
import { SettingsForEpisode } from "@/types/settings";
import { SubtitleCue } from "@/types/subtitle";
import { Captions, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type TopControlsProps = {
  isLoading: boolean;
  loadingDuration: number;
  episodeData?: AnimeEpisodeData;
  isMedium: boolean;
  panelState: PlayerStore['panelState'];
  setPanelState: (state: PlayerStore['panelState']) => void;
  japaneseTranscriptions?: SubtitleCue[];
  settings: SettingsForEpisode
}

export function TopControls({ 
  isLoading,
  loadingDuration,
  episodeData,
  isMedium,
  panelState,
  setPanelState,
  japaneseTranscriptions,
  settings
}: TopControlsProps) {
  return (
    <div className="flex flex-row gap-3 items-center">
      {loadingDuration > 0 && (
        <div className="text-sm text-gray-400">
          Loaded in {(loadingDuration / 1000).toFixed(2)}s
        </div>
      )}
      {(isLoading || !episodeData || !japaneseTranscriptions) ? (
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
                japaneseTranscription={japaneseTranscriptions}
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