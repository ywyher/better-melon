import ProfileTabsLinks from "@/app/user/[username]/components/tabs/links";

export default function ProfileTabs() {
  return (
    <div className="
      w-screen relative left-1/2 -translate-x-1/2
      bg-secondary
    ">
      <div className="
        flex flex-row flex-wrap justify-center gap-2
        h-fit px-4
      ">
        <ProfileTabsLinks />
      </div>
    </div>
  )
}