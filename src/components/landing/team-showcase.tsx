'use client';

import * as React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TeamShowcase() {
  const activities = [
    {
      user: 'Sarah Jenkins',
      initials: 'SJ',
      role: 'Account Exec',
      lead: 'Acme Corporation',
      action: 'updated deal stage to Proposal ($32,000)',
      time: '2 min ago',
    },
    {
      user: 'John Doe',
      initials: 'JD',
      role: 'Sales Rep',
      lead: 'TechFlow Systems',
      action: 'moved deal stage to Proposal',
      time: '8 min ago',
    },
    {
      user: 'Alex Rivera',
      initials: 'AR',
      role: 'SDR Lead',
      lead: 'Solstice Cloud',
      action: 'completed discovery call & logged call notes',
      time: '15 min ago',
    },
    {
      user: 'System Worker',
      initials: 'SW',
      role: 'Queue Engine',
      lead: 'Batch Ingestion #824',
      action: 'ingested 120 leads via CSV stream with zero duplicates',
      time: '1 hour ago',
    },
  ];

  const teamReps = [
    { name: 'Sarah Jenkins', deals: '14 won', rate: '78% win', initials: 'SJ' },
    { name: 'Marcus Sterling', deals: '11 won', rate: '72% win', initials: 'MS' },
    { name: 'Elena Rostova', deals: '9 won', rate: '81% win', initials: 'ER' },
  ];

  return (
    <section id="team" className="py-20 bg-[#F6F9F9] border-b border-[#E1EBEB] text-[#071A1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
              <Users className="h-3.5 w-3.5" /> Team Operations
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#071A1D]">
              A unified workspace for your entire sales force.
            </h2>
            <p className="mt-2 text-sm text-[#4A6B6F] max-w-xl font-normal">
              Shared deal ownership, chronological audit trails, and automatic activity attribution.
            </p>
          </div>

          <Badge variant="outline" className="text-xs font-medium text-[#0D7F84] border-teal-200 bg-teal-50">
            Multi-Tenant RBAC Active
          </Badge>
        </div>

        {/* Operational Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Card (2 columns) */}
          <div className="lg:col-span-2 rounded-2xl border border-[#E1EBEB] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-[#071A1D]">Real-Time Team Activity Stream</span>
              <span className="text-[11px] text-[#0D7F84] font-mono flex items-center gap-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-3">
              {activities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F8FAFA] border border-[#E1EBEB] transition-all hover:border-[#16C1C8]/60"
                >
                  <div className="h-8 w-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-semibold text-[#0D7F84] shrink-0">
                    {item.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-xs font-semibold text-[#071A1D]">
                        {item.user}{' '}
                        <span className="text-[10px] text-[#4A6B6F] font-normal">({item.role})</span>
                      </div>
                      <span className="text-[10px] text-[#4A6B6F] font-mono shrink-0">{item.time}</span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {item.action}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-[#4A6B6F] font-mono">Lead: {item.lead}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Rep Performance & Ownership Strip */}
          <div className="rounded-2xl border border-[#E1EBEB] bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#071A1D]">Top Sales Performers</span>
              <p className="text-[11px] text-[#4A6B6F] mt-0.5">Quota attainment this quarter</p>

              <div className="mt-4 space-y-3">
                {teamReps.map((rep) => (
                  <div
                    key={rep.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFA] border border-[#E1EBEB]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-semibold text-[#0D7F84]">
                        {rep.initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#071A1D]">{rep.name}</div>
                        <div className="text-[10px] text-[#4A6B6F]">{rep.deals}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold text-[#0D7F84] border-teal-200 bg-teal-50">
                      {rep.rate}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-[#4A6B6F] flex items-center justify-between">
              <span>Automatic round-robin assignment</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
