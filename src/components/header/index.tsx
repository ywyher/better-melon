"use client"

import Auth from '@/components/auth/auth';
import DialogWrapper from '@/components/dialog-wrapper';
import { Menu } from '@/components/header/menu';
import Search from '@/components/header/search';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsSmall } from '@/hooks/useMediaQuery';
import { getSession } from '@/lib/auth-client';
import { User } from '@/lib/db/schema';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react';

export default function Header() {
  const [authOpen, setAuthOpen] = useState<boolean>(false)
  const isSmall = useIsSmall()

  const { data: user, isLoading } = useQuery({
    queryKey: ["session", "header"],
    queryFn: async () => {
      const { data } = await getSession()
      return (data?.user as User) || null;
    },
  });

  return (
    <header className="flex flex-row items-center justify-between px-6 py-3 shadow">
      <Link 
        className="font-bold text-xl cursor-pointer"
        href="/"
      >
        Logo
      </Link>
      <Search />
      <div className="flex flex-row gap-5 items-center justify-end">
        <ThemeToggle />
        {user ? (
            <Menu user={user} isSmall={isSmall} />
          ) : (
            <>
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <Avatar className={'bg-foreground rounded-full animate-pulse'} />
                </div>
              ): (
                <DialogWrapper 
                  open={authOpen}
                  setOpen={setAuthOpen}
                  title="Authenticate"
                  trigger={<Button variant="outline" className="rounded-full">Auth</Button>}
                >
                  <Auth
                    open={authOpen}
                    setOpen={setAuthOpen}
                  />
                </DialogWrapper>
              )}
            </>
          )}
      </div>
    </header>
  );
}