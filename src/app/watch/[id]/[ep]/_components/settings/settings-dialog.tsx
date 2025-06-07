"use client"

import DelayController from "@/app/watch/[id]/[ep]/_components/settings/delay-controller"
import type { GeneralSettings } from "@/lib/db/schema"
import DialogWrapper from "@/components/dialog-wrapper"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import SubtitleStyles from "@/components/subtitle/styles/subtitle-styles"
  
export default function SettingsDialog({ generalSettings }: { 
    generalSettings: GeneralSettings
  }) {
    const [open, setOpen] = useState<boolean>(false)

    return (
      <DialogWrapper
        open={open}
        setOpen={setOpen}
        className="
          min-h-[80vh] lg:min-w-[70%]
          flex flex-col gap-5 justify-start items-start
        "
        trigger={<Button variant='outline'>
          <Settings />
        </Button>}
        breakpoint="medium"
      >
        <div className="
          flex flex-col gap-5
          w-full overflow-y-auto
        ">
          <DelayController />
          {/* <Separator />
          <SubtitleStyles syncPlayerSettings={generalSettings.syncPlayerSettings} source="store" /> */}
        </div>
      </DialogWrapper>
    )
}