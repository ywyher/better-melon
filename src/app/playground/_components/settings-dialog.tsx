import SettingsDialog from "@/app/watch/[id]/[ep]/_components/settings/settings-dialog";
import { defaultGeneralSettings } from "@/lib/constants/settings";

export default function SettingsDialogPlayground() {
  return (
    <SettingsDialog 
      generalSettings={defaultGeneralSettings}
    />
  )
}