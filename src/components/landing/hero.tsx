'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, TrendingUp, Users, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DemoModal } from './demo-modal';

export function LandingHero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#071A1D] pt-16 pb-24 text-white">
      {/* Background ambient cyan glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-[#16C1C8]/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Value Prop Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#16C1C8]/30 bg-[#0A2428] px-4 py-1.5 text-xs font-semibold text-[#22D3DA] shadow-sm backdrop-blur-sm mb-6">
          <ShieldCheck className="h-3.5 w-3.5 text-[#16C1C8]" />
          Enterprise Sales & Lead Operations
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl text-white leading-[1.1]">
          Turn Leads{' '}
          <span className="bg-gradient-to-r from-[#16C1C8] via-[#22D3DA] to-teal-100 bg-clip-text text-transparent">
            Into Growth.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#91B7BA] sm:text-lg leading-relaxed font-normal">
          One intelligent workspace for your entire sales operation.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] shadow-lg shadow-[#16C1C8]/25 px-6 py-5 text-sm sm:text-base font-semibold transition-all"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setDemoOpen(true)}
            className="border-[#16454B] bg-[#0A2428] text-slate-200 hover:bg-[#0D2D32] hover:text-white px-6 py-5 text-sm sm:text-base font-semibold transition-all"
          >
            Book a Demo
          </Button>
        </div>
        <div className="mt-3 text-xs text-[#91B7BA]">
          Already have a team account?{' '}
          <Link href="/login" className="text-[#16C1C8] hover:text-[#22D3DA] font-medium underline">
            Sign In
          </Link>
        </div>

        {/* Live CRM Product Visualization Showcase */}
        <div className="mt-12 mx-auto max-w-6xl rounded-2xl border border-[#16454B] bg-[#0A2428] p-3 sm:p-5 shadow-2xl backdrop-blur-xl text-left">
          {/* Header Bar of Mock CRM */}
          <div className="flex items-center justify-between border-b border-[#16454B] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">app.fwscrm.com/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16C1C8] animate-pulse" />
              Live Workspace
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            <div className="rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-3.5 shadow-sm">
              <div className="text-[11px] font-medium text-[#91B7BA]">Total Won Revenue</div>
              <div className="mt-1 text-xl sm:text-2xl font-semibold text-white tracking-tight">$124,500</div>
              <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" /> +14.2% MoM
              </div>
            </div>

            <div className="rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-3.5 shadow-sm">
              <div className="text-[11px] font-medium text-[#91B7BA]">New Leads</div>
              <div className="mt-1 text-xl sm:text-2xl font-semibold text-white tracking-tight">248</div>
              <div className="mt-1 flex items-center text-[11px] font-medium text-[#22D3DA]">
                <Users className="mr-1 h-3 w-3" /> +28 this week
              </div>
            </div>

            <div className="rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-3.5 shadow-sm">
              <div className="text-[11px] font-medium text-[#91B7BA]">Deals Won</div>
              <div className="mt-1 text-xl sm:text-2xl font-semibold text-white tracking-tight">42</div>
              <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-400">
                <CheckCircle className="mr-1 h-3 w-3" /> 84% quota
              </div>
            </div>

            <div className="rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-3.5 shadow-sm">
              <div className="text-[11px] font-medium text-[#91B7BA]">Conversion Rate</div>
              <div className="mt-1 text-xl sm:text-2xl font-semibold text-white tracking-tight">18.4%</div>
              <div className="mt-1 flex items-center text-[11px] font-medium text-sky-400">
                <Zap className="mr-1 h-3 w-3" /> Top decile
              </div>
            </div>
          </div>

          {/* Sales Pipeline Progression Bar */}
          <div className="rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-4 mb-5">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-300">
              <span>Sales Pipeline Funnel</span>
              <span className="text-[#91B7BA] text-[11px]">Active Opportunity Distribution</span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-lg bg-[#0A2428] p-2.5 border border-[#16454B]">
                <div className="font-semibold text-slate-200">New Leads</div>
                <div className="text-[#16C1C8] font-bold mt-0.5">85</div>
              </div>
              <div className="rounded-lg bg-[#0A2428] p-2.5 border border-[#16454B]">
                <div className="font-semibold text-slate-200">Qualified</div>
                <div className="text-sky-400 font-bold mt-0.5">62</div>
              </div>
              <div className="rounded-lg bg-[#0A2428] p-2.5 border border-[#16454B]">
                <div className="font-semibold text-slate-200">Proposal</div>
                <div className="text-amber-400 font-bold mt-0.5">41</div>
              </div>
              <div className="rounded-lg bg-[#0A2428] p-2.5 border border-[#16454B]">
                <div className="font-semibold text-slate-200">Negotiation</div>
                <div className="text-indigo-400 font-bold mt-0.5">28</div>
              </div>
              <div className="rounded-lg bg-[#0D2D32] p-2.5 border border-[#16C1C8]/60 shadow-sm">
                <div className="font-semibold text-[#22D3DA]">Won</div>
                <div className="text-[#16C1C8] font-bold mt-0.5">42</div>
              </div>
            </div>
          </div>

          {/* Side-by-side Leads & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Live Leads Table Snippet */}
            <div className="lg:col-span-2 rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">Recent Lead Submissions</span>
                <span className="text-[11px] text-[#22D3DA] font-medium">Streaming CSV / Direct Ingestion</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A2428] border border-[#16454B]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Alexander Wright</span>
                    <span className="text-[11px] text-[#91B7BA]">alex.wright@apexgroup.com • Canada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Source: S6</span>
                    <Badge variant="teal">Qualified</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A2428] border border-[#16454B]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Sophia Chen</span>
                    <span className="text-[11px] text-[#91B7BA]">sophia.chen@nexusmedia.io • United States</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Source: Google Ads</span>
                    <Badge variant="teal">Proposal</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A2428] border border-[#16454B]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Marcus Vance</span>
                    <span className="text-[11px] text-[#91B7BA]">m.vance@vanceholdings.co.uk • United Kingdom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Source: Referral</span>
                    <Badge variant="teal">Negotiation</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activities Stream */}
            <div className="rounded-xl border border-[#16454B] bg-[#071A1D]/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">Live Team Feed</span>
                <Clock className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 pb-2.5 border-b border-[#16454B]">
                  <div className="h-2 w-2 rounded-full bg-[#16C1C8] mt-1.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200 leading-snug">
                      <span className="font-semibold text-white">David Miller</span> moved Marcus Vance to <span className="text-indigo-400">Negotiation</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">2 mins ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2.5 border-b border-[#16454B]">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200 leading-snug">
                      <span className="font-semibold text-white">Elena Rostova</span> closed deal with <span className="text-emerald-400">Kinetix Bio</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">14 mins ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-200 leading-snug">
                      <span className="font-semibold text-white">System</span> ingested 120 leads via CSV batch
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">1 hour ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
