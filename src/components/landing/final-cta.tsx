'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-[#071A1D] py-20 text-white border-b border-[#16454B]">
      {/* Subtle radial cyan glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#16C1C8]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16C1C8] uppercase tracking-wider mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Start Scaling
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F1FAFA]">
          Ready to take control of your pipeline?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-base text-[#91B7BA] font-normal">
          Start using FWS CRM today.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] shadow-lg shadow-[#16C1C8]/25 px-8 py-5 text-sm sm:text-base font-semibold transition-all"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-[#16454B] bg-[#0A2428] text-slate-200 hover:bg-[#0D2D32] hover:text-white px-8 py-5 text-sm sm:text-base font-semibold transition-all"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-[#91B7BA] font-normal">
          Instant provisioning • Zero lock-in • Complete multi-tenant privacy
        </p>
      </div>
    </section>
  );
}
