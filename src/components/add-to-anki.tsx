import LoadingButton from "@/components/loading-button";
import useAddToAnki from "@/lib/hooks/use-add-to-anki";
import { usePitchAccent } from "@/lib/hooks/use-pitch-accent";
import { generatePitchAccentHTML } from "@/lib/utils/pitch";
import { cn } from "@/lib/utils/utils";
import React from "react";
import { toast } from "sonner";

type AddToAnkiProps = {
  kanji: string;
  definition: string;
  children: React.ReactNode
  sentenceKanji?: string;
  sentenceEnglish?: string;
  sentenceKana?: string;
  kana?: string;
  partOfSpeech?: string;
  className?: string;
  isLoading?: boolean
}

export default function AddToAnki({
  kanji,
  kana,
  definition,
  sentenceKanji,
  sentenceEnglish,
  sentenceKana,
  partOfSpeech,
  children,
  className = "",
  isLoading = false
}: AddToAnkiProps) {
  const { accent } = usePitchAccent(kanji);

  const { addToAnki } = useAddToAnki({
    fields: {
      kanji,
      kana,
      definition,
      "sentence-kanji": sentenceKanji,
      "sentence-english": sentenceEnglish,
      "sentence-kana": sentenceKana,
      "part-of-speech": partOfSpeech,
      "pitch-accent": generatePitchAccentHTML({
        kana: kana || "",
        accent: accent || ""
      })
    },
  });

  return (
    <LoadingButton
      className={cn(
        "cursor-pointer z-20 rounded-sm p-1 w-fit h-7",
        className
      )}
      onClick={() => {
        if(!isLoading) {
          addToAnki();
        } else {
          toast.warning('Either disabled or loading');
        }
      }}
      isLoading={isLoading}
    >
      {children}
    </LoadingButton>
  );
}