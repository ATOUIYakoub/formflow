"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-16 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-[18px] font-bold text-zinc-900">FormFlow</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#product" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Product
          </Link>
          <Link href="#features" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Pricing
          </Link>
          <Link href="#resources" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Resources
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Log in
          </Link>
          <Link href="/register" className="bg-zinc-900 text-white rounded-full px-5 py-2 text-[15px] font-medium hover:bg-zinc-800 transition-colors">
            Get started
          </Link>
        </div>

        <button 
          className="md:hidden p-2 text-zinc-600"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-zinc-200 px-6 py-4 flex flex-col gap-4 shadow-lg">
          <Link href="#product" className="text-zinc-600 font-medium py-2" onClick={() => setIsOpen(false)}>Product</Link>
          <Link href="#features" className="text-zinc-600 font-medium py-2" onClick={() => setIsOpen(false)}>Features</Link>
          <Link href="#pricing" className="text-zinc-600 font-medium py-2" onClick={() => setIsOpen(false)}>Pricing</Link>
          <Link href="#resources" className="text-zinc-600 font-medium py-2" onClick={() => setIsOpen(false)}>Resources</Link>
          <div className="h-px bg-zinc-200 my-2" />
          <Link href="/login" className="text-zinc-600 font-medium py-2" onClick={() => setIsOpen(false)}>Log in</Link>
          <Link href="/register" className="bg-zinc-900 text-white rounded-full px-5 py-2.5 text-center font-medium" onClick={() => setIsOpen(false)}>
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
