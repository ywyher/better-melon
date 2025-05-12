import SessionActionPlayground from "@/app/playground/_components/session-action";
import SessionClientPlayground from "@/app/playground/_components/session-client";
import SessionServerPlayground from "@/app/playground/_components/session-server";
import SubtitleCache from "@/app/playground/_components/subtitle-cache";
import SubtitlePlayground from "@/app/playground/_components/subtitle-playground";
import SubtitleTranscriptionsContainer from "@/app/watch/[id]/[ep]/_components/transcriptions/transcriptions-container";

export default async function HopePlayground() {
  return (
    // <SessionActionPlayground />
    // <SessionClientPlayground />
    // <SessionServerPlayground />
    <SubtitleTranscriptionsContainer />
    // <SubtitleCache />
  );
}