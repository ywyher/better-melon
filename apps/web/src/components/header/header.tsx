"use client"

import Auth from '@/components/auth/auth';
import Logo from '@/components/header/logo';
import React from 'react';
import HeaderLinks from '@/components/header/header-links';
import { cn } from '@/lib/utils/utils';
import { Menu } from '@/components/header/menu';
import { useSession } from '@/lib/queries/user';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const { data: user } = useSession()

  return (
    <header 
      className="
        sticky top-0 z-50 w-full
        border-b-1
      "
    >
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
          "bg-primary-foreground/40 backdrop-blur-xs" 
        )}
      />
      
      <div
        className={cn(
          "relative h-16 max-h-16 container mx-auto",
          "flex flex-row items-center justify-between py-3",
        )}
      >
        <div className='flex flex-row gap-3 items-center'>
          <Logo />
          <HeaderLinks />
        </div>
        <div className="flex flex-row gap-2 items-center justify-end">
          <ThemeToggle className="w-10 h-10 rounded-sm" />
          {user ? <Menu /> : <Auth />}
        </div>
      </div>
    </header>
  );
}