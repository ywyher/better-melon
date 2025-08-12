import ProfileCard from "@/app/user/[username]/components/profile/card";
import ProfileTabs from "@/app/user/[username]/components/tabs/tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile page",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <ProfileCard />
        <ProfileTabs />
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}