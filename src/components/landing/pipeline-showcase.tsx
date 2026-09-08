'use client';

import * as React from 'react';
import { Building, Clock, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PipelineDeal {
  id: string;
  title: string;
  company: string;
  value: string;
  rep: string;
  repInitials: string;
  days: number;
}

interface PipelineColumn {
  name: string;
  leadsCount: number;
  totalValue: string;
  badgeColor: string;
  deals: PipelineDeal[];
}

export function PipelineShowcase() {
  const [hoveredCol, setHoveredCol] = React.useState<number | null>(null);

  const columns: PipelineColumn[] = [
    {
      name: 'New Leads',
      leadsCount: 24,
      totalValue: '$48,000',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      deals: [
        { id: '1', title: 'Enterprise Ingestion Suite', company: 'Apex Global', value: '$18,500', rep: 'Sarah K.', repInitials: 'SK', days: 1 },
        { id: '2', title: 'Multi-Tenant Migration', company: 'Nordic AI', value: '$24,000', rep: 'Marcus S.', repInitials: 'MS', days: 2 },
      ],
    },
    {
      name: 'Qualified',
      leadsCount: 18,
      totalValue: '$72,500',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      deals: [
        { id: '3', title: 'Global CRM Rollout', company: 'Aero Dynamics', value: '$45,000', rep: 'Sarah K.', repInitials: 'SK', days: 4 },
        { id: '4', title: 'Regional Pilot', company: 'Solstice Corp', value: '$27,500', rep: 'Elena R.', repInitials: 'ER', days: 3 },
      ],
    },
    {
      name: 'Proposal',
      leadsCount: 11,
      totalValue: '$94,000',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      deals: [
        { id: '5', title: 'High-Volume Stream Tier', company: 'Vanguard Ltd', value: '$56,000', rep: 'David M.', repInitials: 'DM', days: 6 },
        { id: '6', title: 'Custom Ingestion Engine', company: 'Horizon Media', value: '$38,000', rep: 'Elena R.', repInitials: 'ER', days: 8 },
      ],
    },
    {
      name: 'Negotiation',
      leadsCount: 7,
      totalValue: '$61,000',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      deals: [
        { id: '7', title: 'Enterprise Contract', company: 'Summit Capital', value: '$61,000', rep: 'Sarah K.', repInitials: 'SK', days: 11 },
      ],
    },
    {
      name: 'Won',
      leadsCount: 5,
      totalValue: '$52,000',
      badgeColor: 'bg-[#16C1C8]/20 text-[#22D3DA] border-[#16C1C8]/40',
      deals: [
        { id: '8', title: 'Multi-Org License', company: 'Pinnacle Systems', value: '$52,000', rep: 'Marcus S.', repInitials: 'MS', days: 14 },
      ],
    },
  ];

  return (
    <section id="pipeline" className="py-20 bg-[#071A1D] border-b border-[#16454B] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16C1C8] uppercase tracking-wider mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> Visual Sales Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F1FAFA]">
              Move opportunities from contact to revenue.
            </h2>
            <p className="mt-2 text-sm text-[#91B7BA] max-w-xl font-normal">
              Stage gates, velocity metrics, and clear deal ownership keep your pipeline flowing without stalls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#91B7BA]">Total Pipeline:</span>
            <span className="text-sm font-semibold text-[#22D3DA] bg-[#0A2428] border border-[#16454B] px-3 py-1 rounded-lg">
              65 Deals • $327,500
            </span>
          </div>
        </div>

        {/* 5-Column Kanban Board */}
        <div className="rounded-2xl border border-[#16454B] bg-[#0A2428] p-4 sm:p-5 shadow-2xl overflow-x-auto">
          <div className="grid grid-cols-5 gap-3.5 min-w-[960px]">
            {columns.map((col, idx) => {
              const isWon = col.name === 'Won';
              const isHovered = hoveredCol === idx;

              return (
                <div
                  key={col.name}
                  onMouseEnter={() => setHoveredCol(idx)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`flex flex-col rounded-xl p-3 border transition-all duration-200 ${
                    isWon
                      ? 'bg-[#0D2D32]/80 border-[#16C1C8]/50 shadow-md'
                      : isHovered
                      ? 'bg-[#0D2D32] border-[#16C1C8]/40'
                      : 'bg-[#071A1D]/80 border-[#16454B]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">{col.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${col.badgeColor}`}>
                      {col.leadsCount}
                    </span>
                  </div>

                  {/* Stage Value Metric */}
                  <div className="text-[11px] font-mono text-[#91B7BA] mb-3 pb-2 border-b border-[#16454B]">
                    {col.totalValue}
                  </div>

                  {/* Deal Cards */}
                  <div className="space-y-2.5 flex-1">
                    {col.deals.map((deal) => (
                      <div
                        key={deal.id}
                        className={`rounded-lg border bg-[#0A2428] p-3 transition-all duration-150 hover:border-[#16C1C8]/60 hover:shadow-md ${
                          isWon ? 'border-[#16C1C8]/40' : 'border-[#16454B]'
                        }`}
                      >
                        <div className="text-xs font-semibold text-white line-clamp-1">{deal.title}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#91B7BA] mt-1">
                          <Building className="h-3 w-3 shrink-0" />
                          <span className="line-clamp-1">{deal.company}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-[#16454B]/80 pt-2 text-[11px]">
                          <span className="font-semibold text-[#16C1C8]">{deal.value}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-[#0D2D32] border border-[#16454B] flex items-center justify-center text-[9px] font-bold text-slate-300">
                              {deal.repInitials}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {deal.days}d
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stage Conversion Rate Footer */}
                  <div className="mt-3 pt-2 border-t border-[#16454B] flex items-center justify-between text-[10px] text-[#91B7BA]">
                    <span>Stage velocity</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {idx === 0 ? '92%' : idx === 1 ? '75%' : idx === 2 ? '63%' : idx === 3 ? '71%' : '100%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
