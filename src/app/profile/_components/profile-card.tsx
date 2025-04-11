"use client"

import EditProfile from "@/app/profile/_components/edit-profile";
import ProfilePfp from "@/app/profile/_components/profile-pfp";
import { User } from "@/lib/db/schema";
import { Dispatch, SetStateAction, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ProfilePage } from "@/app/profile/page";
import Image from "next/image";
import { getFileUrl } from "@/lib/utils";
import { Brush } from "lucide-react";

type ProfileCardProps = { user: User, setPage: Dispatch<SetStateAction<ProfilePage>> }

export default function ProfileCard({ user, setPage }: ProfileCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-xl shadow-sm w-full">
      <div className="flex flex-row items-end gap-3 w-full">
        <div className="relative w-24 h-24">
          <Image
              src={getFileUrl(user.image)}
              alt={user.image || ""}
              fill
              className={"object-cover rounded-full border-2 border-foreground"}
          />
        </div>
        <p className="text-lg font-bold">{user.name}</p>
      </div>
      <div className="flex justify-between gap-5 w-full items-center">
        <div className="flex flex-row gap-2">
          <p className="text-muted-foreground">Joined at</p>
          {format(user.createdAt, 'yyyy MMMM d')}
        </div>
        <Button 
          onClick={() => setPage('edit')}
          variant='outline'
          className="p-1 px-2"
        >
          <Brush/>Edit profile
        </Button>
      </div>
    </div>
  );
}
