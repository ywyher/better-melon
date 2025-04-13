// Improved AnkiError component with better styling
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnkiError() {
  return (
    <Card className="
      w-full max-w-2xl mx-auto pt-0 mb-20 md:mb-0
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
                    Add the following URL to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono dark:bg-gray-800">webCorsOriginList</code>:
                  </p>
                  <div className="mt-2 relative group">
                    <div className="bg-gray-100 p-3 rounded-md text-sm font-mono overflow-x-auto dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      <code>http://localhost:3000</code>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-2 top-2 h-7 w-7 p-0 opacity-50 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => navigator.clipboard.writeText("http://localhost:3000")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Your configuration should look similar to:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm font-mono overflow-x-auto dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {`"webCorsOriginList": [
    "http://localhost:3000",
    "http://localhost",
]`}
                  </pre>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold rounded-full h-7 w-7 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">4</span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Refresh & Keep Anki running</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Ensure Anki remains open in the background while using this application
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