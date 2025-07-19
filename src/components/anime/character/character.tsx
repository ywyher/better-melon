import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import { AnimeChracter } from "@/types/anime";
import Image from "next/image";

type CharacterProps = { character: AnimeChracter, className?: string }

export default function Character({ character, className }: CharacterProps) {
  const voiceActor = character.voiceActors?.[0];
  const hasVoiceActor = voiceActor && voiceActor.image?.large;
  
  return (
    <Card
      className={cn(
        "bg-secondary hover:bg-primary-foreground",
        "transition-colors duration-300 ease-in-out",
        hasVoiceActor && "group",
        className,
      )}
    >
      <CardContent className="px-5 flex flex-row gap-3">
        {/* Image container */}
        <div className="relative w-[70px] h-[70px] flex-shrink-0">
          <Image
            src={character.node.image.large}
            alt={`${character.node.name.first} ${character.node.name.last}`}
            width={70}
            height={70}
            className={cn(
              "rounded-full object-cover w-full h-full",
              hasVoiceActor && [
                "transition-opacity duration-300 ease-in-out",
                "group-hover:opacity-0"
              ]
            )}
          />
          
          {hasVoiceActor && (
            <Image
              src={voiceActor.image.large}
              alt={`${voiceActor.name.first} ${voiceActor.name.last}`}
              width={70}
              height={70}
              className="rounded-full object-cover w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
            />
          )}
        </div>
        
        {/* Content container */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 relative">
          {/* Character info */}
          <div className={cn(
            hasVoiceActor && [
              "transition-all duration-300 ease-in-out",
              "group-hover:opacity-0 group-hover:-translate-y-2"
            ]
          )}>
            <div className="font-bold text-lg truncate">
              {character.node.name.last} {character.node.name.first}
            </div>
            <div className="text-muted-foreground text-sm">
              {character.role}
            </div>
          </div>
          
          {/* Voice actor info - only render if exists */}
          {hasVoiceActor && (
            <div className="absolute inset-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out flex flex-col gap-1 justify-center">
              <div className="font-bold text-lg truncate">
                {voiceActor.name.last} {voiceActor.name.first}
              </div>
              <div className="text-muted-foreground text-sm">
                Voice Actor
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}