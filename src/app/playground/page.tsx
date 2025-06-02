'use client'

import { authClient } from "@/lib/auth-client";


export default function Playground() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="relative w-screen h-screen">
      {/* <SubtitleFileSelector subtitleFiles={files} /> */}
    </div>
  );
}