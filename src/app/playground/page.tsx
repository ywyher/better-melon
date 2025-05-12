'use client'

import PlayerPlayground from "@/app/playground/_components/player";
import TranscriptionsHook from "@/app/playground/_components/transcriptions-hook";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getTokenizer } from "kuromojin";
import Link from "next/link";

export default function Playground() {
  // useQuery({
  //   queryKey: ['prefetch-tokenizer'],
  //   queryFn: async () => await getTokenizer({ dicPath: '/dict' })
  // })

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      {/* <TranscriptionsHook /> */}
      {/* <PlayerPlayground /> */}
      {/* <Link href="/playground/hope" className="w-full">
        <Button className="w-full">HOPE</Button>
      </Link> */}
    </div>
  );
}