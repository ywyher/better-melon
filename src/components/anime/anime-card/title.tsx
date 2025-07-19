import AnimeStatusIndicator from "@/components/anime/status-indicator";
import { stripText } from "@/lib/utils/utils";
import { AnimeStatus, AnimeTitle } from "@/types/anime";

export default function AnimeCardTitle({ 
  status, 
  title 
}: {
  status: AnimeStatus;
  title: AnimeTitle;
}) {
  return (
    <div className="
      flex flex-row gap-2 pl-1 py-1
      cursor-pointer rounded-sm
      hover:bg-[#ffffff1a] transition-all
    ">
      <AnimeStatusIndicator animate={false} status={status} />
      <div className="font-bold text-sm">
        {stripText(title.english, 18)}
      </div>
    </div>
  );
}