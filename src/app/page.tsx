import Link from "next/link";
import AnimeTabs from "@/components/home/anime-tabs";
import ResetPasswordHandler from "@/components/reset-password-handler";

export default function Home() {
  return (
    <div>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Better Melon (An <Link className="underline underline-offset-4" href="https://animelon.com">Animelon</Link> Alternative)
        </h1>
        <AnimeTabs />
      </div>
      <ResetPasswordHandler />
    </div>
  );
}