'use client'

import DetailsCharacters from "@/components/info/details/characters"
import DetailsOverview from "@/components/info/details/overview/overview"
import DetailsRecommendations from "@/components/info/details/recommendations"
import DetailsRelations from "@/components/info/details/relations"
import DetailsTabTrigger from "@/components/info/details/tab-trigger"
import DetailsTrailer from "@/components/info/details/trailer"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Anime } from "@/types/anime"
import { Film, Info, Link, PersonStanding, Star } from "lucide-react"
import { useState } from "react"

export type DetailsTab = 'overview' | 'characters' | "relations" | 'recommendations' | 'trailer'

const tabs = [
  {
    name: "overview" as const,
    icon: Info,
    component: DetailsOverview,
  },
  {
    name: "characters" as const,
    icon: PersonStanding,
    component: DetailsCharacters,
  },
  {
    name: "relations" as const,
    icon: Link,
    component: DetailsRelations,
  },
  {
    name: "recommendations" as const,
    icon: Star,
    component: DetailsRecommendations,
  },
  {
    name: "trailer" as const,
    icon: Film,
    component: DetailsTrailer,
  },
]

type DetailsTabsProps = {
  anime: Anime
}

export default function DetailsTabs({ anime }: DetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailsTab>('overview')

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(v) => setActiveTab(v as DetailsTab)}
      className="w-full"
    >
      <TabsList 
        className="
          w-full px-0 py-6
          bg-secondary
          flex flex-row justify-start
          border-1 border-accent 
          rounded-xl rounded-b-none
        "
      >
        {tabs.map((tab, idx) => (
          <DetailsTabTrigger 
            key={tab.name}
            index={idx}
            name={tab.name}
            icon={tab.icon}
            activeTab={activeTab}
          />
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const Component = tab.component
        return (
          <TabsContent
            key={tab.name}
            className="
              pt-5 pb-10 px-10 bg-secondary
              rounded-b-xl
            "
            value={tab.name}
          >
            <Component anime={anime} />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}