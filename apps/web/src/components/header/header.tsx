"use client"

import Auth from '@/components/auth/auth';
import DialogWrapper from '@/components/dialog-wrapper';
import HeaderLinks from '@/components/header/header-links';
import Logo from '@/components/header/logo';
import { Menu } from '@/components/header/menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsSmall } from '@/lib/hooks/use-media-query';
import { useSession } from '@/lib/queries/user';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils/utils';
import React, { useState, useEffect } from 'react';

export default function Header() {
  const isAuthDialogOpen = useAuthStore((state) => state.isAuthDialogOpen)
  const setIsAuthDialogOpen = useAuthStore((state) => state.setIsAuthDialogOpen)

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
  
  const headerBaseClasses = cn(
    "sticky top-0 h-16 max-h-16 container mx-auto z-50",
    "flex flex-row items-center justify-between py-3",
    "transition-all duration-300 ease-in-out",
  );
  
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
          <HeaderLinks />
        )}
      </div>
      <div className="flex flex-row gap-2 items-center justify-end">
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
                open={isAuthDialogOpen}
                setOpen={setIsAuthDialogOpen}
                title="Authenticate"
                trigger={<Button variant="outline" className="rounded-sm">Auth</Button>}
              >
                <Auth
                  user={user || undefined}
                  open={isAuthDialogOpen}
                  setOpen={setIsAuthDialogOpen}
                />
              </DialogWrapper>
            )}
          </>
        )}
      </div>
    </header>
  );
}