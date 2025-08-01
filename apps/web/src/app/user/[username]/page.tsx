"use client"

import EditProfile, { EditProfileSkeleton } from "@/app/user/[username]/components/edit-profile";
import ProfileCard, { ProfileCardSkeleton } from "@/app/user/[username]/components/profile-card";
import { User } from "@/lib/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpdatePassword } from "@/components/update-password";
import { useSession } from "@/lib/queries/user";
import { UserIcon, KeyIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
    const { data, isLoading } = useSession()

    if(isLoading) {
      return <ProfileSkeleton />
    }

    return (
      <div className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
                <ProfileCard user={data as User} />
            </div>
            <div className="md:col-span-3">
              <Tabs defaultValue="account" className="w-full">
                  <TabsList className="w-full mb-6">
                      <TabsTrigger value="account" className="cursor-pointer flex-1">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Account
                      </TabsTrigger>
                      <TabsTrigger value="password" className="cursor-pointer flex-1">
                          <KeyIcon className="h-4 w-4 mr-2" />
                          Password
                      </TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                      <EditProfile user={data as User} />
                  </TabsContent>
                  <TabsContent value="password">
                      <UpdatePassword />
                  </TabsContent>
              </Tabs>
            </div>
        </div>
      </div>
    )
}

function ProfileSkeleton() {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
                <ProfileCardSkeleton />
            </div>
            <div className="md:col-span-3">
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <EditProfileSkeleton />
              </div>
            </div>
        </div>
      </div>
    )
}