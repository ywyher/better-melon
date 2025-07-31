import SubtitlePanel from "@/app/watch/[id]/[ep]/_components/panel/panel";
import SettingsDialog from "@/app/watch/[id]/[ep]/_components/settings/settings-dialog";
import DialogWrapper from "@/components/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { useUIStateStore } from "@/lib/stores/ui-state-store";
import { useWatchStore } from "@/lib/stores/watch-store";
import { Captions, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type TopControlsProps = {
  isMedium: boolean;
}

export function TopControls({ 
  isMedium,
}: TopControlsProps) {
  const isLoading = useWatchStore((state) => state.isLoading)
  const loadingDuration = useWatchStore((state) => state.loadingDuration)

  const panelState = useUIStateStore((state) => state.panelState)
  const setPanelState = useUIStateStore((state) => state.setPanelState)

  return (
    <div className="flex flex-row gap-3 items-center">
      {loadingDuration > 0 && (
        <div className="text-sm text-gray-400">
          Loaded in {(loadingDuration / 1000).toFixed(2)}s
        </div>
      )}
      {(isLoading) ? (
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
          <SettingsDialog  />
          {isMedium ? (
            <DialogWrapper
              trigger={<Button variant='outline'>
                <Captions />
              </Button>}
              className="overflow-y-auto w-full flex flex-col"
              breakpoint='medium'
            >
              <SubtitlePanel />
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