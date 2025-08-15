import { Word } from "@/lib/db/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type WordCard = {
  word: Word
}

export default function WordCard({ 
  word
}: WordCard) {
  return (
    <Card>
      <CardHeader>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  )
}