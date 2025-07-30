import AnimeStatusIndicator from "@/components/anime/status-indicator";
import { stripText } from "@/lib/utils/utils";
import { AnilistStatus, AnilistTitle } from "@better-melon/shared/types";

export default function AnimeCardTitle({ 
  status, 
  title 
}: {
  status: AnilistStatus;
  title: AnilistTitle;
}) {
  // const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="
        flex flex-row gap-2 pl-1 py-1
        cursor-pointer rounded-sm
        hover:bg-[#ffffff1a] transition-all
      "
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
    >
      <AnimeStatusIndicator animate={false} status={status} />
      <div 
        className="font-bold text-sm transition-all"
        title={title.english}
      >
        {/* {isHovered ? title.english : stripText(title.english, 18)} */}
        {stripText(title.english, 18)}
      </div>
    </div>
  );
}