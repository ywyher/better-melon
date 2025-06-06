'use client'

import Link from "next/link";
import AnimeTabs from "@/components/home/anime-tabs";
import ResetPasswordHandler from "@/components/reset-password-handler";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user";
import { useEffect } from "react";

export default function Home() {
  const { data } = useSession()

  const { data: test } = useQuery(userQueries.listAccounts())

  useEffect(() => {
    console.log(test)
  }, [test])

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