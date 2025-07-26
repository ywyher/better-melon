// Improved AnkiError component with better styling
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnkiError() {
  return (
    <Card className="
      w-full min-w-xl max-w-3xl mx-auto pt-0 mb-20 md:mb-0
      shadow-lg border-2 border-amber-200 dark:border-amber-400
      min-h-100vh
    ">
      <CardHeader className="py-3 rounded-se-lg rounded-ss-lg bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-5 w-5" />
          Connection Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
            <AlertCircle className="text-amber-500 dark:text-amber-300 h-6 w-6 flex-shrink-0" />
            <p className="font-medium text-amber-700 dark:text-amber-200">
              Anki needs to be open while you use this app for this feature to work properly
            </p>
          </div>
          
          <div className="mt-2">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-100">Setup instructions:</h3>
            <ol className="space-y-5 pl-2">
              <li className="flex gap-3">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold rounded-full h-7 w-7 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">1</span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Install Anki</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Download and install the latest version from <a href="https://apps.ankiweb.net/" className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center" target="_blank" rel="noreferrer">ankiweb.net <ExternalLink className="h-3 w-3 ml-1" /></a>
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold rounded-full h-7 w-7 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">2</span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Install the AnkiConnect plugin</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Get the plugin from AnkiWeb
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-950 dark:hover:text-blue-300" asChild>
                    <a href="https://ankiweb.net/shared/info/2055492159" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      AnkiConnect plugin
                    </a>
                  </Button>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold rounded-full h-7 w-7 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">3</span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Configure the plugin</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Make sure that <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono dark:bg-gray-800">http://localhost</code> exists in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono dark:bg-gray-800">webCorsOriginList</code>:
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Your configuration should look similar to:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm font-mono overflow-x-auto dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {`"webCorsOriginList": [
    "http://localhost",
]`}
                  </pre>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold rounded-full h-7 w-7 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">4</span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Restart & Refresh & Keep Anki running</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    After installing configuring the plugin restart anki then ensure Anki remains open in the background while using this application
                  </p>
                </div>
              </li>
            </ol>
          </div>
          
          {/* <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              After completing these steps, refresh this page to reconnect to Anki.
            </p>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}