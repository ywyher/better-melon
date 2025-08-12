'use client'

import ActivityHistory from "@/app/user/[username]/overview/components/activity-history/activity-history";
import { useParams } from "next/navigation";

export default function ProfileOverview() {
  const params = useParams();
  const username = String(params.username)

  return (
    <div>
      <ActivityHistory username={username} />
    </div>
  )
}