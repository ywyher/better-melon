import CountryFilter from "@/components/filters/filters/country";
import FormatFilter from "@/components/filters/filters/format";
import GenresFilter from "@/components/filters/filters/genres";
import IsAdultFilter from "@/components/filters/filters/is-adult";
import SeasonFilter from "@/components/filters/filters/season";
import SortsFilter from "@/components/filters/filters/sorts";
import SourceFilter from "@/components/filters/filters/source";
import StatusFilter from "@/components/filters/filters/status";
import TagsFilter from "@/components/filters/filters/tags";
import YearFilter from "@/components/filters/filters/year";
import { AccordionContent } from "@/components/ui/accordion";

export default function FiltersContent() {
  return (
    // {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> */}
    <AccordionContent className="h-fit flex flex-col gap-5">
      <GenresFilter />
      <TagsFilter />
      <SortsFilter />
      <StatusFilter />
      <YearFilter />
      <FormatFilter />
      <SeasonFilter />
      <IsAdultFilter />
      <SourceFilter />
      <CountryFilter />
    </AccordionContent>
  )
}