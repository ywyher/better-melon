import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import FontSizeController from "@/components/subtitle/styles/controls/font-size";
import { GeneralSettings, SubtitleStyles } from "@/lib/db/schema";
import FontFamilyController from "@/components/subtitle/styles/controls/font-family";
import TextColorController from "@/components/subtitle/styles/controls/text-color";
import TextShadowController from "@/components/subtitle/styles/controls/text-shadow";
import TextOpacityController from "@/components/subtitle/styles/controls/text-opacity";
import BackgroundColorController from "@/components/subtitle/styles/controls/background-color";
import BackgroundBlurController from "@/components/subtitle/styles/controls/background-blur";
import BackgroundRadiusController from "@/components/subtitle/styles/controls/background-radius";
import BackgroundOpacityController from "@/components/subtitle/styles/controls/background-opacity";

type SubtitleStylesControlsProps = { 
  transcription: SubtitleStyles['transcription']
  styles: SubtitleStyles
  source: 'store' | 'database'
  syncPlayerSettings: GeneralSettings['syncPlayerSettings']
}

export default function SubtitleStylesControls({ 
  transcription,
  styles,
  source,
  syncPlayerSettings
}: SubtitleStylesControlsProps) {
    return (
      <Card className="w-full border-none pt-0 shadow-md">
          <CardHeader>
              <CardTitle className="m-0 p-0"></CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
              <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-1 rounded-full"></div>
                      <h3 className="text-lg font-medium">Font Styles</h3>
                  </div>
                  <div className="pl-3 pr-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FontSizeController 
                          value={styles.fontSize}
                          transcription={transcription}
                          source={source}
                          syncPlayerSettings={syncPlayerSettings}
                        />
                        <FontFamilyController 
                          value={styles.fontFamily}
                          transcription={transcription}
                          source={source}
                          syncPlayerSettings={syncPlayerSettings}
                        />
                      </div>
                  </div>
              </div>

              <Separator className="my-2" />
              
              {/* Text Appearance Section */}
              <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-1 rounded-full"></div>
                      <h3 className="text-lg font-medium">Text Appearance</h3>
                  </div>
                  <div className="pl-3 pr-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextColorController 
                          value={styles.textColor}
                          transcription={transcription}
                          source={source}
                          syncPlayerSettings={syncPlayerSettings}
                        />
                        <TextShadowController 
                          value={styles.textShadow}
                          transcription={transcription}
                          source={source}
                          syncPlayerSettings={syncPlayerSettings}
                        />
                      </div>
                      <TextOpacityController 
                          value={styles.textOpacity}
                          transcription={transcription}
                          source={source}
                          syncPlayerSettings={syncPlayerSettings}
                      />
                  </div>
              </div>
              
              <Separator className="my-2" />
              
              {/* Background Style Section */}
              <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-1 rounded-full"></div>
                      <h3 className="text-lg font-medium">Background Style</h3>
                  </div>
                  <div className="pl-3 pr-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <BackgroundColorController 
                              value={styles.backgroundColor}
                              transcription={transcription}
                              source={source}
                              syncPlayerSettings={syncPlayerSettings}
                          />
                          <BackgroundOpacityController
                              value={styles.backgroundOpacity}
                              transcription={transcription}
                              source={source}
                              syncPlayerSettings={syncPlayerSettings}
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <BackgroundBlurController 
                              value={styles.backgroundBlur}
                              transcription={transcription}
                              source={source}
                              syncPlayerSettings={syncPlayerSettings}
                          />
                          <BackgroundRadiusController 
                              value={styles.backgroundRadius}
                              transcription={transcription}
                              source={source}
                              syncPlayerSettings={syncPlayerSettings}
                          />
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
    )
}