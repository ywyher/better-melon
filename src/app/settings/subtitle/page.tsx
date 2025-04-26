import TranscriptionOrder from "@/app/settings/subtitle/_transcription-order/transcription-order";
import SubtitleSettings from "@/app/settings/subtitle/_subtitle-settings/subtitle-settings";
import SubtitleStyles from "@/app/settings/subtitle/_subtitle-styles/subtitle-styles";
import { Separator } from "@/components/ui/separator";

export default function SubtitleSettingsPage() {
  return (
    <div className="flex flex-col gap-5 pt-5">
      <SubtitleSettings />
      <Separator />
      <TranscriptionOrder />
      <Separator />
      <SubtitleStyles />
    </div>
  )
}