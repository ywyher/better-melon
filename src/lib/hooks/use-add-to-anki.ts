import { invokeAnkiConnect, takeSnapshot } from "@/lib/anki"
import { ankiQueries } from "@/lib/queries/anki"
import { usePlayerStore } from "@/lib/stores/player-store"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type UseAddToAnkiProps = {
  word?: string | null;
  sentence?: string | null;
  definition?: string | null;
}

export default function useAddToAnki({ word, sentence, definition }: UseAddToAnkiProps) {
  const { data: preset } = useQuery(ankiQueries.defaultPreset())

  const router = useRouter()
  const player = usePlayerStore((state) => state.player)

  const addToAnki = async () => {
    const connection = await invokeAnkiConnect('deckNames', 6)
    if(connection.error) {
      toast.warning("Make sure to open an instance of Anki")
      return
    }

    if(!preset?.fields || !word || !sentence) {
      return toast.warning("You have to setup anki configurations.", {
        action: {
          onClick: () => {
            router.push('/settings/anki')
          },
          label: 'Go!'
        }
      })
    }
  
    const noteFields = Object.entries(preset.fields)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      return {
        [key]: value === "expression"
          ? word
          : value === "sentence"
          ? sentence
          : value == 'definition'
          ? definition
          : ""
      };
    });

    const noteOptions = {
      "note": {
        "deckName": preset.deck,
        "modelName": preset.model,
        "fields": noteFields.reduce((acc, obj) => ({ ...acc, ...obj }), {}),
        "options": {
          "allowDuplicate": false,
          "duplicateScope": "deck",
          "duplicateScopeOptions": {
            "deckName": "Default",
            "checkChildren": false,
            "checkAllModels": false
          }
        },
        "tags": [
          "better-melon"
        ],
        "picture": (Object.entries(preset.fields).find(([,value]) => value == 'image') && player.current) ? [
          {
            "data": takeSnapshot(player.current),
            "filename": `frame_${Date.now()}.png`,
            "fields": [
              "Image"
            ]
          }
        ] : undefined
      }
    };

    const { error } = await invokeAnkiConnect(preset.isGui ? 'guiAddCards' : 'addNote', 6, noteOptions)
  
    if(error) {
      toast.error(error)
    } else {
      toast.success("Note created successfully")
    }
  }

  return {
    addToAnki
  }
}