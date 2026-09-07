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
    { label: 'Features', href: '#features' },
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'Team', href: '#team' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-crm-header/95 backdrop-blur-md border-b border-slate-800 shadow-md'
          : 'bg-crm-header border-b border-slate-800/80'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white tracking-tight focus:outline-none focus:ring-2 focus:ring-crm-teal rounded-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crm-teal text-white shadow-sm font-black text-lg">
            F
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-base">FWS <span className="text-crm-teal font-extrabold">CRM</span></span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Enterprise Suite</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-crm-teal rounded px-1.5 py-0.5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-crm-teal rounded-md"
          >
            Log In
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-crm-teal hover:bg-crm-teal-hover text-white shadow font-semibold px-4"
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
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-crm-teal"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-crm-header px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-md bg-crm-teal px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-crm-teal-hover"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
