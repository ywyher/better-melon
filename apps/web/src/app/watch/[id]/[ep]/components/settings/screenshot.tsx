import { Button } from "@/components/ui/button";
import { GeneralSettings } from "@/lib/db/schema";
import { usePlayerStore } from "@/lib/stores/player-store";
import { downloadBase64Image, mapScreenshotNamingPatternValues, takeSnapshot } from "@/lib/utils/utils";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultGeneralSettings, screenshotFormats } from "@/lib/constants/settings";
import { SelectInput } from "@/components/form/select-input";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useEpisodeStore } from "@/lib/stores/episode-store";

export default function Screenshot() {
  const player = usePlayerStore((state) => state.player);
  const generalSettings = useSettingsStore((settings) => settings.general)
  const animeMetadata = useEpisodeStore((state) => state.episodeData?.metadata)

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [selectedFormat, setSelectedFormat] = useState(generalSettings.screenshotFormat);

  const handleScreenShot = (customFileName?: string, outputFormat = generalSettings.screenshotFormat) => {
    if (!player.current || !animeMetadata) return;

    let name;
    if (customFileName) {
      name = customFileName;
    } else {
      name = mapScreenshotNamingPatternValues({
        pattern: generalSettings.screenshotNamingPattern, 
        animeMetadata
      });
    }

    const data = takeSnapshot(player.current, outputFormat);
    if(!data) return toast.error('Something went wrong');
    downloadBase64Image(data, `${name}.${outputFormat}`, outputFormat);
  };

  const openScreenshotDialog = () => {
    if(!animeMetadata) return
    setCustomName(mapScreenshotNamingPatternValues({
      pattern: generalSettings.screenshotNamingPattern || defaultGeneralSettings.screenshotNamingPattern,
      animeMetadata
    }));
    setSelectedFormat(generalSettings.screenshotFormat);
    setIsDialogOpen(true);
  };

  const handleClick = () => {
    if (generalSettings.screenshotNamingDialog) {
      openScreenshotDialog();
    } else {
      handleScreenShot();
    }
  };

  const formatOptions = screenshotFormats.map(fmt => ({
    value: fmt,
    label: fmt.toUpperCase()
  }));

  return (
    <div>
      <Button
        variant='secondary'
        onClick={handleClick}
      >
        <Camera />
      </Button>

      {generalSettings.screenshotNamingDialog && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex flex-row gap-2">
              <DialogTitle>Save Screenshot</DialogTitle>
              <TooltipWrapper>
                You can disable the dialog and instantly download the file without renaming it by chaning the settings in the settings page
              </TooltipWrapper>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="screenshot-name" className="text-md font-medium">
                Screenshot Name
              </Label>
              <div className="flex flex-row gap-2">
                <Input
                  id="screenshot-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full"
                />
                <SelectInput
                  options={formatOptions}
                  value={selectedFormat}
                  onChange={(v) => setSelectedFormat(v as GeneralSettings['screenshotFormat'])}
                  className="w-fit"
                  placeholder="Select format"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="mr-2">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={() => {
                  handleScreenShot(customName, selectedFormat);
                  setIsDialogOpen(false);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}