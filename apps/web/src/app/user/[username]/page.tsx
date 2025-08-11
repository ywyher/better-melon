"use client"

import ActivityHistory from "@/app/user/[username]/components/activity-history/activity-history";
import UserCard from "@/app/user/[username]/components/profile/card";
import { useParams } from "next/navigation";

export default function User() {
    const params = useParams();
    const username = String(params.username)

    return (
      <div className="flex flex-col gap-5">
        <UserCard username={username} />
        <ActivityHistory username={username} />
      </div>
    )
}