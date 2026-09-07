'use client';

import { BarChart3, TrendingUp, Users, Target, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AnalyticsShowcase() {
  const sources = [
    { name: 'S6 Campaign Partner', count: 482, share: '46%', color: 'bg-crm-teal' },
    { name: 'Organic Direct', count: 245, share: '24%', color: 'bg-sky-600' },
    { name: 'Referral & Affiliates', count: 188, share: '18%', color: 'bg-indigo-600' },
    { name: 'Outbound SDR', count: 125, share: '12%', color: 'bg-amber-500' },
  ];

  const stageVelocity = [
    { stage: 'New -> Qualified', avgDays: '1.8 days', benchmark: 'Top 10%' },
    { stage: 'Qualified -> Proposal', avgDays: '3.4 days', benchmark: 'Optimized' },
    { stage: 'Proposal -> Won', avgDays: '6.2 days', benchmark: 'Target Met' },
  ];

  return (
    <section id="analytics" className="py-20 bg-white border-b border-crm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Real-Time Intelligence
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Turn CRM Data Into Better Decisions
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            Monitor pipeline velocity, conversion milestones, and lead acquisition efficiency with database-level aggregation queries.
          </p>
        </div>

        {/* Analytics Visual Card */}
        <div className="rounded-2xl border border-crm-border bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-crm-teal" />
                Performance Dashboard & Velocity Metrics
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                PostgreSQL aggregated metrics refreshed across current organization leads
              </p>
            </div>
            <Badge variant="teal">Real-time Neon Aggregates</Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Source Distribution Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-200">Lead Source Attribution</span>
                <span className="text-[11px] text-slate-400">1,040 Total Ingested</span>
              </div>

              <div className="space-y-3.5">
                {sources.map((src) => (
                  <div key={src.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{src.name}</span>
                      <span className="font-mono text-slate-400">{src.count} ({src.share})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${src.color}`}
                        style={{ width: src.share }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Velocity & Conversion Funnel */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-200">Pipeline Stage Velocity</span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +18.4% Win Rate
                </span>
              </div>

              <div className="space-y-4">
                {stageVelocity.map((stage) => (
                  <div key={stage.stage} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{stage.stage}</div>
                      <div className="text-[11px] text-teal-400 font-mono mt-0.5">{stage.avgDays} avg time</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {stage.benchmark}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingestion & Data Quality Metrics */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-200">Data Quality & Ingestion</span>
                  <span className="text-[11px] text-teal-400 font-mono">Streaming Worker</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
                    <span className="text-slate-400">Total Validated Records</span>
                    <span className="font-bold text-white font-mono">12,480</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
                    <span className="text-slate-400">Duplicates Filtered</span>
                    <span className="font-bold text-amber-400 font-mono">312 prevented</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
                    <span className="text-slate-400">Average Import Latency</span>
                    <span className="font-bold text-emerald-400 font-mono">1.2ms / row</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Database query optimization active</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-crm-teal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
