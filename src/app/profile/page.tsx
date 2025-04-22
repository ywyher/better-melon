"use client"

import EditProfile from "@/app/profile/_components/edit-profile";
import ProfileCard from "@/app/profile/_components/profile-card";
import Header from "@/components/header";
import { User } from "@/lib/db/schema";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpdatePassword } from "@/components/update-password";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/queries/user";

export type ProfilePage = "edit"

export default function Profile() {
    const [page, setPage] = useState<ProfilePage>('edit')

    const { data, isLoading } = useSession()

    if(isLoading) return <>Loading...</>

    return (
        <>
            <Header />
            <div className="grid grid-cols-4">
                <div className="col-span-1">
                    <ProfileCard
                        user={data as User} 
                        setPage={setPage}
                    />
                </div>
                <div className="col-span-3">
                    {page == 'edit' && (
                        <Tabs 
                            defaultValue="account" 
                            className="flex flex-col gap-5"
                        >
                            <TabsList className="w-full">
                                <TabsTrigger value="account" asChild>
                                    <Button variant="ghost">Account</Button>
                                </TabsTrigger>
                                <TabsTrigger value="password" asChild>
                                    <Button variant="ghost">Password</Button>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">
                                <EditProfile user={data as User} />
                            </TabsContent>
                            <TabsContent value="password">
                                <UpdatePassword />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </>
    )
}