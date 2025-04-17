import SettingsLinks from "@/app/settings/settings-links";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "User settings page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <div className="
            absolute left-0 right-0 top-36
        ">
            <div className="
                flex flex-col justify-end gap-5
                bg-gradient-to-t from-neutral-100 to-white 
                dark:from-neutral-900 dark:to-neutral-950
                border-b border-neutral-200 dark:border-neutral-800
            ">
                <div className="container mx-auto">
                    <p className="font-bold text-3xl text-neutral-800 dark:text-neutral-100">Settings</p>
                </div>
                <div className="container mx-auto">
                    <SettingsLinks />
                </div>
            </div>
        </div>
        <div className="mt-[calc(15vh+2rem)]">
            {children}
        </div>
    </>
  );
}