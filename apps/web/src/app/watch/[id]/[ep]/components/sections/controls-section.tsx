import CueNavigations from "@/app/watch/[id]/[ep]/components/settings/cue-navigations";
import EpisodeNavigations from "@/app/watch/[id]/[ep]/components/settings/episode-navigations";
import SettingsToggles from "@/app/watch/[id]/[ep]/components/settings/settings-toggles";
import Screenshot from "@/app/watch/[id]/[ep]/components/settings/screenshot";
import EnabledTranscriptions from "@/components/enabled-transcriptions";
import { Separator } from "@/components/ui/separator";
import { useWatchStore } from "@/lib/stores/watch-store";

export default function ControlsSection() {
  const isLoading = useWatchStore((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="w-full">
        <>Loading</>
      </div>
    );
  }

  return (
      <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
              <div className="flex flex-col-reverse gap-2">
                <EnabledTranscriptions />
                <div className="flex flex-row gap-1">
                    <SettingsToggles  />
                    <Screenshot />
                </div>
            </div>
              <Separator />
              <div className="flex flex-row gap-2 w-full justify-between items-center">
                  <div className="flex flex-col gap-2 w-full flex-1">
                      <CueNavigations direction="previous" />
                      <CueNavigations direction="next" />
                  </div>
                  <Separator orientation="vertical" />
                  <div className="flex flex-col gap-2 w-full flex-1">
                      <EpisodeNavigations
                        direction="previous" 
                      />
                      <EpisodeNavigations 
                        direction="next" 
                      />
                  </div>
              </div>
          </div>
      </div>
  );
}