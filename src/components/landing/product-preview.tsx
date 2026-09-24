'use client';

import * as React from 'react';
import { ArrowUpRight, Target, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ProductPreview() {
  const [timeframe, setTimeframe] = React.useState<'7D' | '30D' | '90D'>('30D');

  return (
    <section id="features" className="py-20 bg-[#F6F9F9] border-b border-[#E1EBEB] text-[#071A1D] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Product Intelligence
            </div>
            <h2 className="crm-section-title text-[#071A1D]">
              Know what’s driving growth.
            </h2>
            <p className="crm-body mt-2 text-[#4A6B6F] max-w-xl">
              Continuous intake velocity, closed revenue momentum, and deal conversion rates across every channel.
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="inline-flex rounded-lg bg-white border border-[#E1EBEB] p-1 text-xs font-medium shadow-sm">
            {(['7D', '30D', '90D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded-md px-3 py-1 transition-all ${
                  timeframe === t
                    ? 'bg-[#071A1D] text-[#22D3DA] font-semibold shadow-sm'
                    : 'text-[#4A6B6F] hover:text-[#071A1D]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Product Intelligence Composition Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Card (2 Columns) */}
          <div className="lg:col-span-2 rounded-2xl border border-[#E1EBEB] bg-white p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEFF0]">
              <div>
                <span className="crm-label text-[#4A6B6F]">Net Attributed Pipeline Value</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="crm-metric text-3xl font-bold text-[#071A1D]">$348,200</span>
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +24.8%
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[11px] font-semibold text-[#0D7F84] border-[#16C1C8]/40 bg-teal-50">
                Live Pulse
              </Badge>
            </div>

            {/* Interactive SVG Area Curve */}
            <div className="mt-6">
              <div className="h-44 w-full">
                <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="previewGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16C1C8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22D3DA" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#E1EBEB" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#E1EBEB" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="#E1EBEB" />

                  {/* Shaded Area */}
                  <path
                    d="M 30 130 C 120 110, 200 95, 270 70 C 350 45, 450 60, 570 20 L 570 140 L 30 140 Z"
                    fill="url(#previewGradLight)"
                  />

                  {/* Stroke */}
                  <path
                    d="M 30 130 C 120 110, 200 95, 270 70 C 350 45, 450 60, 570 20"
                    fill="none"
                    stroke="#16C1C8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Highlight Nodes */}
                  <circle cx="30" cy="130" r="4" fill="#FFFFFF" stroke="#16C1C8" strokeWidth="2.5" />
                  <circle cx="270" cy="70" r="4" fill="#FFFFFF" stroke="#16C1C8" strokeWidth="2.5" />
                  <circle cx="570" cy="20" r="5" fill="#16C1C8" stroke="#071A1D" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-[#4A6B6F] font-mono mt-3 px-2">
                <span>Week 1: $38k</span>
                <span>Week 2: $74k</span>
                <span>Week 3: $124k</span>
                <span className="text-[#071A1D] font-bold">Current: $348k</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Operational Velocity Indicators */}
          <div className="flex flex-col gap-4">
            {/* Conversion Rate Card */}
            <div className="rounded-2xl border border-[#E1EBEB] bg-white p-5 shadow-sm flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="crm-label text-[#4A6B6F]">Lead-to-Deal Conversion</span>
                <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0D7F84]">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="crm-metric text-3xl font-bold text-[#071A1D]">72.4%</div>
                <div className="text-xs text-emerald-600 font-semibold mt-0.5">+8.1% vs industry benchmark</div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#16C1C8] to-[#0D7F84] w-[72%]" />
              </div>
            </div>

            {/* Ingestion Velocity Card */}
            <div className="rounded-2xl border border-[#E1EBEB] bg-white p-5 shadow-sm flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="crm-label text-[#4A6B6F]">Ingestion Velocity</span>
                <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0D7F84]">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="crm-metric text-3xl font-bold text-[#071A1D]">
                  4,820 <span className="text-xs font-normal text-[#4A6B6F]">leads/min</span>
                </div>
                <div className="text-xs text-[#0D7F84] font-semibold mt-0.5">Streaming queue • Zero browser tab freeze</div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#4A6B6F]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Background workers active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
