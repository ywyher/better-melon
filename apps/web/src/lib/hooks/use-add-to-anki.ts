import { invokeAnkiConnect } from "@/lib/anki"
import { ankiQueries } from "@/lib/queries/anki"
import { usePlayerStore } from "@/lib/stores/player-store"
import { takeSnapshot } from "@/lib/utils/utils"
import { AnkiFieldKey } from "@/types/anki"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type UseAddToAnkiProps = {
  fields: Partial<Record<AnkiFieldKey, string>>;
}

export default function useAddToAnki({ fields }: UseAddToAnkiProps) {
  const { data: preset } = useQuery(ankiQueries.defaultPreset())

  const router = useRouter()
  const player = usePlayerStore((state) => state.player)

  const addToAnki = async () => {
    const connection = await invokeAnkiConnect('deckNames', 6)
    if(connection.error) {
      toast.warning("Make sure to open an instance of Anki")
      return
    }

    if(!preset?.fields || !fields) {
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
    .filter(([, value]) => value) // filter out falsy preset values
    .reduce((acc, [key, value]) => {
      const fieldValue = fields[value as keyof typeof fields];
      if (fieldValue !== null && fieldValue !== undefined) { // Only add non-null values
        acc[key] = fieldValue;
      }
      return acc;
    }, {} as Record<string, string>);

    const noteOptions = {
      "note": {
        "deckName": preset.deck,
        "modelName": preset.model,
        "fields": noteFields,
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