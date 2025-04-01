import Search from '@/components/header/search';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2 shadow">
      <Link 
        className="font-bold text-xl cursor-pointer"
        href="/"
      >
        Logo
      </Link>
      <Search />
      <div className="w-24">
        <ThemeToggle />
      </div>
    </header>
  );
}