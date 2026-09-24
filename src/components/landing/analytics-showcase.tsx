'use client';

import * as React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AnalyticsShowcase() {
  const sources = [
    { name: 'Direct Ingestion', count: 395, share: '38%', color: 'bg-[#16C1C8]' },
    { name: 'Referral Partners', count: 302, share: '29%', color: 'bg-emerald-500' },
    { name: 'Organic Search', count: 218, share: '21%', color: 'bg-teal-600' },
    { name: 'Campaign Ads', count: 125, share: '12%', color: 'bg-slate-400' },
  ];

  const pipelineVelocity = [
    { stage: 'New → Qualified', days: '1.4d', pct: 85, color: 'bg-teal-500' },
    { stage: 'Qualified → Proposal', days: '2.8d', pct: 68, color: 'bg-amber-500' },
    { stage: 'Proposal → Negotiation', days: '4.1d', pct: 54, color: 'bg-indigo-500' },
    { stage: 'Negotiation → Won', days: '5.6d', pct: 72, color: 'bg-[#16C1C8]' },
  ];

  return (
    <section id="analytics" className="py-20 bg-white border-b border-[#E1EBEB] text-[#071A1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
              <BarChart3 className="h-3.5 w-3.5" /> Performance Analytics
            </div>
            <h2 className="crm-section-title text-[#071A1D]">
              Real-time sales telemetry.
            </h2>
            <p className="crm-body mt-2 text-[#4A6B6F] max-w-xl">
              Continuous aggregation over your leads, pipeline velocity, and conversion milestones.
            </p>
          </div>

          <Badge variant="outline" className="text-xs font-semibold text-[#0D7F84] border-teal-200 bg-teal-50">
            PostgreSQL Real-time Engine
          </Badge>
        </div>

        {/* 4-Card Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Revenue Momentum with Area Curve */}
          <div className="rounded-2xl border border-[#E1EBEB] bg-[#F8FAFA] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#4A6B6F]">
                <span className="crm-label text-[#4A6B6F]">Quarterly Revenue</span>
                <span className="flex items-center text-emerald-600 font-semibold text-[11px]">
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +18.4%
                </span>
              </div>
              <div className="crm-metric text-3xl font-bold text-[#071A1D] mt-1">$248,000</div>
              <div className="text-[11px] text-[#4A6B6F] mt-0.5 font-medium">Won deal attribution</div>
            </div>

            {/* Sparkline Curve */}
            <div className="h-20 w-full mt-4">
              <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16C1C8" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#22D3DA" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 45 Q 40 50, 70 30 T 140 22 T 200 8 L 200 60 L 0 60 Z"
                  fill="url(#revGradLight)"
                />
                <path
                  d="M 0 45 Q 40 50, 70 30 T 140 22 T 200 8"
                  fill="none"
                  stroke="#16C1C8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Circular 72% Conversion Gauge */}
          <div className="rounded-2xl border border-[#E1EBEB] bg-[#F8FAFA] p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#4A6B6F]">
              <span className="crm-label text-[#4A6B6F]">Win Conversion</span>
              <span className="text-[10px] text-[#0D7F84] font-mono font-semibold">Top 5%</span>
            </div>

            <div className="flex items-center justify-center my-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress ring */}
                  <path
                    className="text-[#16C1C8]"
                    strokeDasharray="72, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="crm-metric text-2xl font-bold text-[#071A1D]">72%</span>
                  <span className="crm-label text-[9px] text-[#4A6B6F] uppercase">Closed Won</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-center text-[#4A6B6F] font-mono font-medium">
              42 won / 58 qualified deals
            </div>
          </div>

          {/* Card 3: Pipeline Velocity Bars */}
          <div className="rounded-2xl border border-[#E1EBEB] bg-[#F8FAFA] p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#4A6B6F] mb-3">
              <span className="crm-label text-[#4A6B6F]">Stage Velocity</span>
              <span className="text-emerald-600 font-mono text-[11px] font-semibold">Avg 3.4d</span>
            </div>

            <div className="space-y-2.5">
              {pipelineVelocity.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 truncate font-medium">{stage.stage}</span>
                    <span className="font-mono text-[#0D7F84] font-semibold shrink-0 ml-1">{stage.days}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color}`}
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-[#4A6B6F] mt-3 pt-2 border-t border-slate-200 flex justify-between">
              <span>Cycle efficiency</span>
              <span className="text-[#071A1D] font-semibold font-mono">98.2% on pace</span>
            </div>
          </div>

          {/* Card 4: Lead Sources Breakdown */}
          <div className="rounded-2xl border border-[#E1EBEB] bg-[#F8FAFA] p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#4A6B6F] mb-3">
              <span className="crm-label text-[#4A6B6F]">Source Attribution</span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">1,040 leads</span>
            </div>

            <div className="space-y-2.5">
              {sources.map((src) => (
                <div key={src.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">{src.name}</span>
                    <span className="font-mono text-[#4A6B6F] font-semibold">{src.share}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${src.color}`}
                      style={{ width: src.share }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-[#4A6B6F] mt-3 pt-2 border-t border-slate-200 flex justify-between">
              <span>Top Channel</span>
              <span className="text-[#0D7F84] font-semibold">Direct CSV Stream</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
