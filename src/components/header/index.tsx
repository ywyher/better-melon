// Header.tsx
"use client"
import Auth from '@/components/auth/auth';
import DialogWrapper from '@/components/dialog-wrapper';
import Logo from '@/components/header/logo';
import { Menu } from '@/components/header/menu';
import Search from '@/components/header/search';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsSmall } from '@/hooks/useMediaQuery';
import { getSession } from '@/lib/auth-client';
import { User } from '@/lib/db/schema';
import { useQuery } from '@tanstack/react-query';
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
    <header className="
      fixed top-0 left-0 right-0 z-50
      flex flex-row items-center justify-between px-2 py-[.5rem] shadow
      bg-[#0E0E0E] border border-b-secondary
      h-[var(--header-height)]
    ">
      <Logo />
      <Search />
      <div className="flex flex-row gap-2 items-center justify-end">
        <ThemeToggle className="w-10 h-10 rounded-sm" />
        {user ? (
          <Menu user={user} isSmall={isSmall} />
        ) : (
          <>
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Avatar className={'bg-foreground rounded-sm animate-pulse'} />
              </div>
            ): (
              <DialogWrapper
                open={authOpen}
                setOpen={setAuthOpen}
                title="Authenticate"
                trigger={<Button variant="outline" className="rounded-sm">Auth</Button>}
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