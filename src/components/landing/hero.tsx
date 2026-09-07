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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pt-16 pb-24 text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-crm-teal/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Value Prop Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3.5 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-sm mb-6">
          <ShieldCheck className="h-3.5 w-3.5 text-crm-teal" />
          Enterprise-Grade Lead Lifecycle Architecture
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
          Turn Every Customer Interaction <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            Into Predictable Growth
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
          Manage leads, customers, deals, tasks, communication, and team performance — all from one powerful, scalable CRM platform.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-crm-teal hover:bg-crm-teal-hover text-white shadow-lg shadow-teal-900/30 px-6 py-6 text-base font-semibold"
            >
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setDemoOpen(true)}
            className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-800 hover:border-slate-600 px-6 py-6 text-base font-semibold"
          >
            Book a Demo
          </Button>
        </div>

        {/* Live CRM Product Visualization Showcase */}
        <div className="mt-14 mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-5 shadow-2xl backdrop-blur-xl text-left">
          {/* Header Bar of Mock CRM */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">app.fwscrm.com/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Workspace
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] font-medium text-slate-400">Total Revenue</div>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight">$124,500</div>
              <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" /> +14.2% MoM
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] font-medium text-slate-400">New Leads</div>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight">248</div>
              <div className="mt-1 flex items-center text-[11px] font-semibold text-teal-400">
                <Users className="mr-1 h-3 w-3" /> +28 this week
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] font-medium text-slate-400">Deals Won</div>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight">42</div>
              <div className="mt-1 flex items-center text-[11px] font-semibold text-emerald-400">
                <CheckCircle className="mr-1 h-3 w-3" /> 84% quota
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] font-medium text-slate-400">Conversion Rate</div>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight">18.4%</div>
              <div className="mt-1 flex items-center text-[11px] font-semibold text-sky-400">
                <Zap className="mr-1 h-3 w-3" /> Top decile
              </div>
            </div>
          </div>

          {/* Sales Pipeline Progression Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 mb-5">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-300">
              <span>Sales Pipeline Funnel</span>
              <span className="text-slate-400 text-[11px]">Active Opportunity Distribution</span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700">
                <div className="font-semibold text-slate-200">New Leads</div>
                <div className="text-teal-400 font-bold mt-0.5">85</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700">
                <div className="font-semibold text-slate-200">Qualified</div>
                <div className="text-sky-400 font-bold mt-0.5">62</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700">
                <div className="font-semibold text-slate-200">Proposal</div>
                <div className="text-amber-400 font-bold mt-0.5">41</div>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700">
                <div className="font-semibold text-slate-200">Negotiation</div>
                <div className="text-indigo-400 font-bold mt-0.5">28</div>
              </div>
              <div className="rounded-lg bg-teal-950/70 p-2.5 border border-teal-600/50">
                <div className="font-semibold text-teal-300">Won</div>
                <div className="text-teal-400 font-bold mt-0.5">42</div>
              </div>
            </div>
          </div>

          {/* Side-by-side Leads & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Live Leads Table Snippet */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">Recent Lead Submissions</span>
                <span className="text-[11px] text-teal-400">Streaming CSV / Direct Ingestion</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Alexander Wright</span>
                    <span className="text-[11px] text-slate-400">alex.wright@apexgroup.com • Canada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Source: S6</span>
                    <Badge variant="teal">Qualified</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Elena Rostova</span>
                    <span className="text-[11px] text-slate-400">elena.r@nordictech.io • United Kingdom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Source: Direct</span>
                    <Badge variant="blue">Proposal</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Marcus Sterling</span>
                    <span className="text-[11px] text-slate-400">m.sterling@horizon.net • United States</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Source: S6</span>
                    <Badge variant="emerald">Won</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Recent Team Timeline
              </div>
              <div className="space-y-3 text-[11px]">
                <div className="border-l-2 border-teal-500 pl-3">
                  <div className="font-medium text-slate-200">CSV Ingestion Processed</div>
                  <div className="text-slate-400">500 leads imported cleanly (0 duplicates)</div>
                  <span className="text-[10px] text-slate-500 font-mono">2 mins ago</span>
                </div>

                <div className="border-l-2 border-sky-500 pl-3">
                  <div className="font-medium text-slate-200">Status Updated to Won</div>
                  <div className="text-slate-400">Marcus Sterling marked as Won ($24k deal)</div>
                  <span className="text-[10px] text-slate-500 font-mono">14 mins ago</span>
                </div>

                <div className="border-l-2 border-indigo-500 pl-3">
                  <div className="font-medium text-slate-200">Lead Assigned</div>
                  <div className="text-slate-400">Auto-routed Elena Rostova to Senior Account Rep</div>
                  <span className="text-[10px] text-slate-500 font-mono">35 mins ago</span>
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
