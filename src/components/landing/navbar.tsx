'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#features' },
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Leads', href: '#leads' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-[#071A1D]/95 backdrop-blur-md border-b border-[#16454B] shadow-lg shadow-[#071A1D]/50'
          : 'bg-[#071A1D]/80 backdrop-blur-sm border-b border-[#16454B]/70'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-xl text-white tracking-tight focus:outline-none focus:ring-2 focus:ring-[#16C1C8] rounded-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16C1C8] text-[#071A1D] shadow-sm font-bold text-lg">
            F
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-base">FWS <span className="text-[#16C1C8] font-bold">CRM</span></span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Enterprise Suite</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-slate-300 hover:text-[#22D3DA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#16C1C8] rounded px-1.5 py-0.5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#16C1C8] rounded-md"
          >
            Log In
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] shadow font-semibold px-4 transition-all"
            >
              Get Started Free <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-slate-300 hover:bg-[#0D2D32] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#16C1C8]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#16454B] bg-[#0A2428] px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-[#0D2D32] hover:text-[#22D3DA] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#16454B] flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-md border border-[#16454B] bg-[#0D2D32]/80 px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D2D32]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-md bg-[#16C1C8] px-4 py-2 text-xs font-semibold text-[#071A1D] shadow hover:bg-[#22D3DA]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
