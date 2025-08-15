import { Word } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DotSeparator from "@/components/dot-separator";
import { useTokenStyles } from "@/lib/hooks/use-token-styles";
import { useMemo } from "react";
import { getPitchAccent } from "@/lib/utils/pitch";
import { wordStatusesColors } from "@/lib/constants/word";

type WordCard = {
  word: Word
}

export default function WordCard({
  word
}: WordCard) {

  const { 
    getPitchStyles,
  } = useTokenStyles()

  const accent = useMemo(() => {
    if(!word.pitches?.length) return null;
    return getPitchAccent({
      position: word.pitches[0].position,
      reading: word.word
    });
  }, [word])

  const styles = useMemo(() => {
    const pitchStyles = getPitchStyles(false, accent)
    return {
      ...pitchStyles
    }
  }, [accent])

  return (
    <Card className="relative flex flex-row justify-between overflow-hidden min-h-[90px] border-0">
      {/* Background image positioned on right side only */}
      {word.animeBanner && (
        <>
          <div 
            className="absolute top-0 right-0 bottom-0 w-3/4 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${word.animeBanner})`,
            }}
          />
          {/* Overlay on the image for better contrast */}
          <div className="absolute top-0 right-0 bottom-0 w-3/4 bg-black/30" />
          {/* Gradient mask to fade the image toward center */}
          <div className="absolute top-0 right-0 bottom-0 w-3/4 bg-gradient-to-l from-transparent to-background" />
        </>
      )}
      
      {/* Content */}
      <CardHeader className="relative z-10 flex-1">
        <CardTitle 
          className="text-xl font-semibold text-foreground"
          style={{
            ...styles
          }}
        >
          {word.word}
        </CardTitle>
        <CardDescription className="flex flex-row">
          <p className="text-sm text-muted-foreground">
            {word.animeTitle.english || word.animeTitle.romaji}
          </p>
          <DotSeparator />
          <p 
            className="text-sm text-muted-foreground"
            style={{
              color: wordStatusesColors[word.status]
            }}
          >
            {word.status}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex items-center p-4">
        {/* <div className="text-right">
          <div className="text-xs text-muted-foreground">
            Episode {word.animeEpisode}
          </div>
          <div className={`text-sm font-medium ${
            word.status === 'known' ? 'text-green-500' : 
            word.status === 'learning' ? 'text-yellow-500' : 
            word.status === 'unknown' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {word.status}
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}