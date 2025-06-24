import KnownWords from "@/app/settings/word/_known-words/known-words";
import WordSettings from "@/app/settings/word/_settings/word-settings";
import { Separator } from "@/components/ui/separator";

export default function WordindeSettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <WordSettings />
      <Separator />
      <KnownWords />
    </div>
  )
}