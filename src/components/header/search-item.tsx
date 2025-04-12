"use client"
import { Anime } from "@/types/anime"
import Image from "next/image"

type SearchItemProps = {
  title: Anime['title']['english'],
  cover: Anime['coverImage']['large']
  status: Anime['status']
  seasonYear: Anime['seasonYear']
}

export default function SearchItem({
  cover,
  seasonYear,
  status,
  title
}: SearchItemProps) {
  return (
    <div className="flex flex-row gap-3 w-full">
      <div>
        <Image
          src={cover}
          alt={title || ""}
          width="70"
          height='70'
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-md">{title}</p>
        <p className="text-gray-500 text-sm">{status}</p>
      </div>
    </div>
  )
}