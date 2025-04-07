import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AnkiError() {
  return (
    <Card className="max-w-2xl w-full shadow-lg border-2 border-amber-200 dark:border-amber-400">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200 dark:bg-amber-950 dark:border-amber-400">
            <AlertCircle className="text-amber-500 dark:text-amber-300 h-6 w-6 flex-shrink-0" />
            <p className="font-semibold text-amber-700 dark:text-amber-200">
              ANKI NEEDS TO BE OPENED AS LONG AS YOU ARE USING THIS APP IN ORDER FOR THIS FEATURE TO FUNCTION PROPERLY
            </p>
          </div>
          
          <div className="mt-2">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">To use this feature, you need to:</h3>
            <ol className="space-y-4 pl-2">
              <li className="flex gap-2">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full h-6 w-6 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">1</span>
                <span className="text-gray-700 dark:text-gray-300">Have Anki installed</span>
              </li>
              <li className="flex gap-2">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full h-6 w-6 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">2</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Install the <a href="https://ankiweb.net/shared/info/2055492159" className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300">Anki Connect</a> plugin
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full h-6 w-6 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">3</span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>Go to the plugin config tab and add <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono dark:bg-gray-800">https://better-melon.vercel.app</code> to <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono dark:bg-gray-800">webCorsOriginList</code> so it looks like:</p>
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm font-mono overflow-x-auto dark:bg-gray-800 dark:text-gray-200">
                    {`"webCorsOriginList": [
                        "https://better-melon.vercel.app",
                        "http://localhost"
                    ]`}
                  </pre>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full h-6 w-6 flex-shrink-0 dark:bg-indigo-900 dark:text-indigo-300">4</span>
                <span className="text-gray-700 dark:text-gray-300">Keep Anki running in the background</span>
              </li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}