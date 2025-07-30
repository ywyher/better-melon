'use client'

import DetailsCharacters from "@/components/info/details/characters"
import DetailsEpisodesList from "@/components/info/details/episodes-list"
import DetailsOverview from "@/components/info/details/overview/overview"
import DetailsRecommendations from "@/components/info/details/recommendations"
import DetailsRelations from "@/components/info/details/relations"
import DetailsTabTrigger from "@/components/info/details/tab-trigger"
import DetailsTrailer from "@/components/info/details/trailer"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Anime, AnimeDetails } from "@/types/anime"
import { Film, Info, Link, PersonStanding, Star, TvMinimalPlay } from "lucide-react"
import { useState } from "react"

export type DetailsTab = 'overview' | 'characters' | "relations" | 'recommendations' | 'trailer' | "episodes"

const tabs = [
  {
    name: "overview" as DetailsTab,
    icon: Info,
    component: DetailsOverview,
  },
  {
    name: "episodes" as DetailsTab,
    icon: TvMinimalPlay,
    component: DetailsEpisodesList,
  },
  {
    name: "characters" as DetailsTab,
    icon: PersonStanding,
    component: DetailsCharacters,
  },
  {
    name: "relations" as DetailsTab,
    icon: Link,
    component: DetailsRelations,
  },
  {
    name: "recommendations" as DetailsTab,
    icon: Star,
    component: DetailsRecommendations,
  },
  {
    name: "trailer" as DetailsTab,
    icon: Film,
    component: DetailsTrailer,
  },
]

type DetailsTabsProps = {
  anime: AnimeDetails
}

export default function DetailsTabs({ anime }: DetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailsTab>('overview')

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(v) => setActiveTab(v as DetailsTab)}
      className="w-full h-full flex flex-col"
    >
      <TabsList
        className="
          w-full px-0 py-6
          bg-secondary
          flex flex-row justify-start
          border-1 border-accent 
          rounded-xl rounded-b-none
          flex-shrink-0
          overflow-x-scroll overflow-y-hidden
        "
      >
        {tabs.map((tab, idx) => (
          <DetailsTabTrigger 
            key={tab.name}
            index={idx}
            name={tab.name}
            icon={tab.icon}
            activeTab={activeTab}
            className={tab.name == 'episodes' ? "xl:hidden" : ""}
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
              flex-1 overflow-y-auto
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