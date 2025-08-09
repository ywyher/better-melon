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

  const isSmall = useIsSmall();
  
  const { data: user, isLoading } = useSession()

  const isAuthenticated = user && !user.isAnonymous
    
  return (
    <header 
      className="
        sticky top-0 z-50 w-full
        border-b-1
      "
    >
      {/* Full-width background with blur effect */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
          "bg-primary-foreground/40 backdrop-blur-xs" 
        )}
      />
      
      {/* Content container */}
      <div
        className={cn(
          "relative h-16 max-h-16 container mx-auto",
          "flex flex-row items-center justify-between py-3",
        )}
      >
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
      </div>
    </header>
  );
}