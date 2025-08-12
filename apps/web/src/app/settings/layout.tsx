import SettingsTabs from "@/app/settings/settings-tabs";
import SettingsTitle from "@/app/settings/settings-title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "User settings page",
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <div className="
          absolute left-0 right-0 top-40
        ">
            <div className="
                flex flex-col justify-end gap-5
                bg-gradient-to-t from-neutral-100 to-white 
                dark:from-neutral-900 dark:to-neutral-950
                border-b border-neutral-200 dark:border-neutral-800
            ">
                <div className="container mx-auto">
                  <SettingsTitle />
                </div>
                <div className="container mx-auto">
                    <SettingsTabs />
                </div>
            </div>
        </div>
        <div className="mt-[calc(15vh+2rem)] pt-5">
            {children}
        </div>
    </>
  );
}