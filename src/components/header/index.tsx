"use client"

import Auth from '@/components/auth/auth';
import DialogWrapper from '@/components/dialog-wrapper';
import HeaderTabs from '@/components/header/header-tabs';
import Logo from '@/components/header/logo';
import { Menu } from '@/components/header/menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsSmall } from '@/hooks/useMediaQuery';
import { getSession } from '@/lib/auth-client';
import { User } from '@/lib/db/schema';
import { useSession } from '@/lib/queries/user';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function Header() {
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const isSmall = useIsSmall();
  
  const { data: user, isLoading } = useSession()

  const isAuthenticated = user && !user.isAnonymous
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const headerBaseClasses = "sticky top-0 container mx-auto z-50 flex flex-row items-center justify-between py-3 transition-all duration-300 ease-in-out";
  
  const scrolledClasses = scrolled ? cn(
    "px-3 top-2 rounded-lg", 
    "border border-gray-200 dark:border-gray-800 shadow-md",
    "bg-gradient-to-r from-gray-50/70 to-white/70 dark:from-gray-900/70 dark:to-gray-950/70",
    "backdrop-blur-md"
  ) : 'bg-transparent';
  
  return (
    <header className={`${headerBaseClasses} ${scrolledClasses}`}>
      <div className='flex flex-row gap-3 items-center'>
        <Logo />
        {!isSmall && (
          <HeaderTabs />
        )}
      </div>
      <div className="flex flex-row gap-2 items-center justify-end">
        {isSmall && (
          <Button className="w-10 h-10 rounded-sm" variant="outline">
            <SearchIcon />
          </Button>
        )}
        <ThemeToggle className="w-10 h-10 rounded-sm" />
        {isAuthenticated ? (
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
                  user={user || undefined}
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