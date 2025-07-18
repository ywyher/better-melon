'use client'

import ResetPasswordHandler from "@/components/reset-password-handler";
import TopTrending from "@/components/home/top-trending";
import AnimeList from "@/components/home/anime-list";
import { Award, Clock, Heart, LucideIcon, TrendingUp } from "lucide-react";
import { AnimeInListVariables } from "@/types/anime";

const animeListConfigs: {
  title: string;
  icon: LucideIcon;
  variables: AnimeInListVariables
}[] = [
  {
    title: "Trending",
    icon: TrendingUp,
    variables: {
      sort: 'TRENDING_DESC',
      includeExtraLargeCover: true,
      includeSeasonYear: true,
      includeStatus: true,
      perPage: 10
    }
  },
  {
    title: "Most Popular",
    icon: Award,
    variables: {
      sort: 'POPULARITY_DESC',
      includeExtraLargeCover: true,
      includeSeasonYear: true,
      includeStatus: true,
      perPage: 10
    }
  },
  {
    title: "Most Favorite",
    icon: Heart,
    variables: {
      sort: 'FAVOURITES_DESC',
      includeExtraLargeCover: true,
      includeSeasonYear: true,
      includeStatus: true,
      perPage: 10
    }
  },
  {
    title: "Top Airing",
    icon: TrendingUp,
    variables: {
      sort: 'TRENDING_DESC',
      status: 'RELEASING',
      includeExtraLargeCover: true,
      includeSeasonYear: true,
      includeStatus: true,
      perPage: 10
    }
  },
  {
    title: "Top Upcoming",
    icon: Clock,
    variables: {
      sort: 'POPULARITY_DESC',
      status: 'NOT_YET_RELEASED',
      includeExtraLargeCover: true,
      includeSeasonYear: true,
      includeStatus: true,
      perPage: 10
    }
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
        {animeListConfigs.map((config) => (
          <AnimeList
            key={config.title}
            title={config.title}
            icon={config.icon}
            variables={config.variables}
          />
        ))}
      </div>
      <ResetPasswordHandler />
    </div>
  );
}