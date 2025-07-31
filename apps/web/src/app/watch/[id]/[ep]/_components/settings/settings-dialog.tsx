"use client"

import DialogWrapper from "@/components/dialog-wrapper"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useState } from "react"
import SubtitleStyles from "@/components/subtitle/styles/subtitle-styles"
import DelayController from "@/app/watch/[id]/[ep]/_components/settings/delay-controller"
import { Separator } from "@/components/ui/separator"
import { useIsLarge } from "@/lib/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettingsStore } from "@/lib/stores/settings-store"
  
export default function SettingsDialog() {
    const [open, setOpen] = useState<boolean>(false)
    const isLarge = useIsLarge()

    const generalSettings = useSettingsStore((settings) => settings.general)

    return (
      <DialogWrapper
        open={open}
        setOpen={setOpen}
        className="
          flex flex-col justify-start
          min-h-[85vh] max-h-[85vh] lg:min-w-[75%] lg:max-w-[90%]
          p-0 overflow-hidden gap-0 m-0 space-y-0
        "
        trigger={
          <Button variant='outline' className="gap-2">
            <Settings className="w-4 h-4" />
          </Button>
        }
        breakpoint="medium"
        title="Settings"
        description="Configure your preferences and subtitle styles"
      >
        {isLarge ? (
          <Tabs 
            defaultValue="styles"
            className="
              h-full w-full min-h-0
              grid grid-cols-12 gap-10
            "
          >
            <div className="w-64 border-r bg-muted/20 p-4 col-span-2 h-full">
              <TabsList className="flex flex-col h-fit w-full bg-transparent space-y-1 p-0">
                <TabsTrigger 
                  value="general"
                  className="cursor-pointer w-full justify-start px-4 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                >
                  General Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="styles"
                  className="cursor-pointer w-full justify-start px-4 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                >
                  Subtitle Styles
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 flex flex-col col-span-10 min-h-0">
              <TabsContent
                value="general"
                className="flex-1 p-6 m-0 overflow-y-auto h-full"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">General Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure general application preferences
                  </p>
                </div>
                <DelayController />
                <div className="h-[70vh]"></div>
              </TabsContent>
              <TabsContent
                value="styles"
                className="flex-1 p-0 m-0 min-h-0 flex flex-col"
              >
                <div className="flex-1 min-h-0">
                  <div className="p-6 h-full">
                    <SubtitleStyles 
                      syncSettings={generalSettings.syncSettings} 
                      source="store"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="h-full flex flex-col gap-0 min-h-0">
            <div className="flex-1 min-h-0 p-4 pt-0 space-y-6 overflow-scroll">
              <div className="pt-3">
                <h3 className="text-lg font-medium mb-4">General Settings</h3>
                <DelayController />
              </div>
              <Separator />
              <div className="flex-1 min-h-0">
                <SubtitleStyles 
                  syncSettings={generalSettings.syncSettings} 
                  source="store"
                />
              </div>
            </div>
          </div>
        )}
      </DialogWrapper>
    )
}