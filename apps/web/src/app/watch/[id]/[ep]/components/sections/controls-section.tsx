import CueNavigations from "@/app/watch/[id]/[ep]/components/controls/cue-navigations";
import EpisodeNavigations from "@/app/watch/[id]/[ep]/components/controls/episode-navigations";
import SettingsToggles from "@/app/watch/[id]/[ep]/components/player/settings-toggles";
import Screenshot from "@/app/watch/[id]/[ep]/components/controls/screenshot";
import EnabledTranscriptions from "@/components/enabled-transcriptions";
import { Separator } from "@/components/ui/separator";
import { useStreamingStore } from "@/lib/stores/streaming-store";
import { Card } from "@/components/ui/card";
import ControlsSkeleton from "@/app/watch/[id]/[ep]/components/controls/skeleton";

export default function ControlsSection() {
  const isLoading = useStreamingStore((state) => state.isLoading)

  if (isLoading) return <ControlsSkeleton />

  return (
      <Card className="flex flex-col gap-10 p-5 py-4 bg-secondary">
          <div className="flex flex-col gap-5">
              <div className="flex flex-col-reverse gap-3">
                <div className="flex flex-row gap-2">
                  <EnabledTranscriptions className="bg-background" />
                  <Screenshot />
                </div>
                <SettingsToggles  />
            </div>
            <Separator />
            <div className="flex flex-row gap-2 w-full justify-between items-center">
                <div className="flex flex-col gap-2 w-full flex-1">
                    <CueNavigations direction="previous" />
                    <CueNavigations direction="next" />
                </div>
                <Separator orientation="vertical" />
                <div className="flex flex-col gap-2 w-full flex-1">
                    <EpisodeNavigations direction="previous" />
                    <EpisodeNavigations direction="next" />
                </div>
            </div>
          </div>
      </Card>
  );
}