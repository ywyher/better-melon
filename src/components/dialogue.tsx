import type { Mode, Sub as TSub } from "@/types";
import Sub, { SubSkeleton } from "@/components/sub";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dispatch, SetStateAction, useState, useTransition } from "react";

type Modes = {
  name: Mode
}[]

export default function Dialogue({ subs, mode, setMode, isLoading }: {
  subs: TSub[] | undefined;
  mode: Mode,
  setMode: Dispatch<SetStateAction<Mode>>
  isLoading: boolean
}) {
  // Use useTransition to mark state updates as non-urgent
  const [isPending, startTransition] = useTransition();
  
  // Track the previous valid subs to show while loading new ones
  const [previousSubs, setPreviousSubs] = useState<TSub[] | undefined>(subs);
  
  // If we have new subs that aren't loading, update our previous subs
  if (subs && !isLoading && JSON.stringify(subs) !== JSON.stringify(previousSubs)) {
    setPreviousSubs(subs);
  }
  
  // Use either current subs or previous subs to prevent empty states
  const displaySubs = isLoading ? previousSubs : subs;
  
  const modes: Modes = [
    { name: "japanese" }, // normal|default
    { name: "hiragana" },
    { name: "katakana" },
    { name: "romaji" },
  ]
  
  const handleModeChange = (newMode: Mode) => {
    // Use transition to mark this state update as non-urgent
    startTransition(() => {
      setMode(newMode);
    });
  };
  
  return (
    <div className={`relative ${(isPending || isLoading) ? 'opacity-80' : 'opacity-100'}`}>
      {(isPending || isLoading) && (
        <Badge className="absolute top-1 right-2 rounded-full text-sm">
            Loading...
        </Badge>
      )}
      
      <Tabs defaultValue={mode || modes[0].name} value={mode}>
        <TabsList className="w-full">
          {modes.map((modeOption, index) => (
            <TabsTrigger
              key={index}
              value={modeOption.name}
              onClick={() => handleModeChange(modeOption.name)}
              disabled={isPending || isLoading}
              className="cursor-pointer"
            >
              {modeOption.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={mode}>
          {displaySubs && displaySubs.length ? (
            <div className="space-y-2">
              {displaySubs.map((sub) => (
                <Sub key={sub.id} sub={sub} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[1,2,3,4,5].map((_, index) => (
                <SubSkeleton key={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}