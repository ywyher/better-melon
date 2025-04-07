import { Menu } from '@/components/header/menu';
import Search from '@/components/header/search';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import React from 'react';

export default function Header() {
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
        <Menu />
      </div>
    </header>
  );
}