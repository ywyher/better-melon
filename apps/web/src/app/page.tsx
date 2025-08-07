'use client'

import ResetPasswordHandler from "@/components/reset-password-handler";
import TopTrending from "@/components/home/top-trending/top-trending";
import AnimeList from "@/components/home/anime-list/anime-list";
import { Award, Clock, Heart, LucideIcon, TrendingUp } from "lucide-react";
import { AnimeListQueryVariableKeys, AnimeListQueryVariables } from "@/types/anime";
import { queryVariables } from "@/lib/constants/anime";
import ContinueWatching from "@/components/home/continue-watching/continue-watching";

const animeLists: {
  title: string;
  name: AnimeListQueryVariableKeys
  icon: LucideIcon;
  variables: AnimeListQueryVariables
}[] = [
  {
    title: "Trending",
    name: 'trending',
    icon: TrendingUp,
    variables: queryVariables.list.trending({})
  },
  {
    title: "Most Popular",
    name: 'popular',
    icon: Award,
    variables: queryVariables.list.popular({})
  },
  {
    title: "Most Favourite",
    name: 'favourite',
    icon: Heart,
    variables: queryVariables.list.favourite({})
  },
  {
    title: "Top Airing",
    name: 'topAiring',
    icon: TrendingUp,
    variables: queryVariables.list.topAiring({})
  },
  {
    title: "Top Upcoming",
    name: 'topUpcoming',
    icon: Clock,
    variables: queryVariables.list.topUpcoming({})
  }
];

export default function Home() {
  return (
    <div>
      <div className="
        container mx-auto
        flex flex-col gap-20
      ">
        <TopTrending />
        <ContinueWatching />
        {animeLists.map((list) => (
          <AnimeList
            key={list.name}
            title={list.title}
            name={list.name}
            icon={list.icon}
            variables={list.variables}
          />
        ))}
      </div>
      <ResetPasswordHandler />
    </div>
  );
}