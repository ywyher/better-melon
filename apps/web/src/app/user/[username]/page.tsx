"use client"

import EditProfile from "@/app/user/[username]/components/edit-profile";
import ProfileCard from "@/app/user/[username]/components/profile-card";
import { User as TUser } from "@/lib/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpdatePassword } from "@/components/update-password";
import { useSession } from "@/lib/queries/user";
import { UserIcon, KeyIcon } from "lucide-react";

export default function User() {
    const { data, isLoading } = useSession()

    if(isLoading) return <>Loading...</>

    return (
      <div>
        <ProfileCard user={data as TUser} />
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
    )
}