import Link from "next/link";
import Header from "@/components/header";
import Auth from "@/components/auth/auth";
import AnimeTabs from "@/components/home/anime-tabs";
import ResetPasswordHandler from "@/components/reset-password-handler";

export default function Home() {
  return (
    <>
      <Header />
      <Auth />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Better Melon (An <Link className="underline underline-offset-4" href="https://animelon.com">Animelon</Link> Alternative)
        </h1>
        <AnimeTabs />
      </div>
      <ResetPasswordHandler />
    </>
  );
}