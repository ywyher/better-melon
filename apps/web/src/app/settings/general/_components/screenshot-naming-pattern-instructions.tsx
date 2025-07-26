import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { HelpCircle } from "lucide-react";

const screenshotNamingPatternInstructions = [
  { name: 'title', description: 'Name of the anime' },
  { name: 'counter', description: 'Current episode number' },
  { name: 'random', description: 'Random value to make sure each screenshot name is unique' },
  { name: 'timestamp', description: 'Current timestamp' },
];

export default function ScreenshotNamingPatternInstructions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <div className="flex flex-col gap-3">
          <div>
            <h4 className="font-medium">Naming Pattern Variables</h4>
            <p className="text-sm text-gray-500">
              You can use variables enclosed in curly braces {"{variable}"} mixed with any regular text.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {screenshotNamingPatternInstructions.map((item) => (
              <div key={item.name} className="flex flex-row items-center gap-1">
                <Badge variant='secondary' className="w-fit h-fit font-mono text-sm rounded">
                  {`{${item.name}}`}
                </Badge>
                <div className="text-sm">{item.description}</div>
              </div>
            ))}
          </div>
          <Separator />
          <div>
            <h5 className="text-sm font-medium mb-1">Examples:</h5>
            <ul className="text-xs text-gray-500 space-y-1">
              <li><span className="font-mono">{"{title}_{timestamp}"}</span> → Stiens;Gate_20250519-143022</li>
              <li><span className="font-mono">Ep{"{counter}"}_SS{"{random}"}</span> → Ep42_SS8f3d2</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}