'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { DataContext } from '../DataProvider';
import { UserButton } from '@clerk/nextjs';

const Navbar = () => {
  const { view, setView } = useContext(DataContext);
  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-10 py-3 bg-white/30 backdrop-blur-lg shadow-md z-50 h-16">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <img src="/IntervueLogo.png" alt="Intervue Logo" className="h-15 w-auto animate-pulse" />
        <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight font-mono">SynvueAI</h1>
      </div>


      {/* User button and mobile toggle */}
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />

        {/* Mobile Toggle */}
        <button
          onClick={() => setView(!view)}
          className="md:hidden text-2xl text-indigo-700 z-50 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {view ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
