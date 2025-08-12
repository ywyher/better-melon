"use client"

import ProfileOverview from "@/app/user/[username]/overview/page";

export default function User() {
  return (
    <div className="flex flex-col gap-5">
      <ProfileOverview />
    </div>
  )
}