"use client"

import UserCard from "@/app/user/[username]/components/card";
import { userQueries, useSession } from "@/lib/queries/user";
import { User as TUser } from "@/lib/db/schema";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import AnonAlert from "@/app/user/[username]/components/anon-alert";
import { useQuery } from "@tanstack/react-query";

export default function User() {
    const params = useParams();
    const profileUsername = String(params.username)

    const { data, isLoading } = useQuery({
      ...userQueries.profile({ profileUsername }),
      enabled: !!profileUsername
    })

    const isOwner = useMemo(() => {
      if(!data?.currentUser || !profileUsername) return false;
      return (data.currentUser?.name == profileUsername)
        && (data.currentUser?.id == data.profileUser?.id)
    }, [profileUsername, data])

    if(isLoading || !data?.profileUser) return <>Loading...</>

    return (
      <div>
        <UserCard user={data.profileUser as TUser} editable={isOwner} />
        
        <div className="
          mt-[calc(var(--banner-height-small)-5rem)]
          md:mt-[calc(var(--banner-height)-5rem)]
        ">
          {data?.currentUser?.isAnonymous && isOwner && <AnonAlert />}
        </div>
      </div>
    )
}