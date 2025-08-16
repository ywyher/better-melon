'use client'

import HistoryActivity from "@/app/user/[username]/overview/components/history-activity/history-activity";
import WordsActivity from "@/app/user/[username]/overview/components/words-activity/words-activity";
import { useParams } from "next/navigation";

export default function ProfileOverview() {
  const params = useParams();
  const username = String(params.username)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <HistoryActivity username={username} />
      <WordsActivity username={username} />
    </div>
  )
}