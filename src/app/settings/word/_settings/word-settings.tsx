'use client'

import LearningStatus from "@/app/settings/word/_settings/learning-status";
import PitchColoring from "@/app/settings/word/_settings/pitch-coloring";
import { WordSettingsSkeleton } from "@/app/settings/word/_settings/word-settings-skeleton";
import { settingsQueries } from "@/lib/queries/settings";
import { useQuery } from "@tanstack/react-query";

export default function WordSettings() {
  const { data: settings, isLoading } = useQuery(settingsQueries.word())

  if(!settings || isLoading) return <WordSettingsSkeleton />

  return (
    <div className="flex flex-col gap-4">
      <LearningStatus value={settings.learningStatus} />
      <PitchColoring value={settings.pitchColoring} />
    </div>
  )
}