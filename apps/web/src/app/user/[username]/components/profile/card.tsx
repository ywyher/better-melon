import AnonAlert from "@/app/user/[username]/components/profile/anon-alert";
import ProfilePfp from "@/app/user/[username]/components/profile/pfp";
import ProfileBanner from "@/app/user/[username]/components/profile/banner";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileQueries } from "@/lib/queries/profile";

export default function ProfileCard({ username }: { username: string }) {
  const { data, isLoading } = useQuery({
    ...profileQueries.profile({ username }),
    enabled: !!username
  })

  const isOwner = useMemo(() => {
    if(!data?.currentUser || !username) return false;
    return (data.currentUser?.name == username)
      && (data.currentUser?.id == data.profileUser?.id)
  }, [username, data])

  const profileUser = useMemo(() => {
    if(!data) return null;
    return data.profileUser
  }, [data])

  if(isLoading || !profileUser) return <>Loading...</>
  
  return (
    <div
      className="
        mb-[calc(var(--banner-height-small)-5rem)]
        md:mb-[calc(var(--banner-height)-5rem)]
      "
    >
      <div className="
        absolute inset-0 top-0 left-1/2 transform -translate-x-1/2
        w-full h-[var(--banner-height-small)] md:h-[var(--banner-height)]
        mb-[calc(var(--banner-height-small)-5rem)]
        md:mb-[calc(var(--banner-height)-5rem)]
      ">
        <ProfileBanner userId={profileUser.id} banner={profileUser.banner} editable={isOwner} />
        <div className="
          h-full container mx-auto
          pb-10 z-20
          flex items-end gap-10
        ">
          <ProfilePfp userId={profileUser.id} image={profileUser.image} editable={isOwner} />
          <div 
            className="
              z-20
              text-2xl font-bold text-foreground
            "
          >
            {profileUser.name}
          </div>
        </div>
      </div>
      {data?.currentUser?.isAnonymous && isOwner && <AnonAlert />}
    </div>
  );
}