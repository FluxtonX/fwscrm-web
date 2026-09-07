'use client';

import { useState } from 'react';
import { DollarSign, Building, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PipelineCard {
  id: string;
  title: string;
  company: string;
  value: string;
  rep: string;
  daysInStage: number;
}

interface Column {
  name: string;
  badge: string;
  cards: PipelineCard[];
}

export function PipelineShowcase() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const columns: Column[] = [
    {
      name: 'New Leads',
      badge: '3 Deals',
      cards: [
        { id: '1', title: 'Enterprise Ingestion Suite', company: 'Apex Group', value: '$18,500', rep: 'Sarah K.', daysInStage: 1 },
        { id: '2', title: 'Multi-Tenant Migration', company: 'Nordic Tech', value: '$24,000', rep: 'Marcus S.', daysInStage: 2 },
        { id: '3', title: 'Data Security Add-on', company: 'Quantix AI', value: '$9,200', rep: 'Elena R.', daysInStage: 3 },
      ],
    },
    {
      name: 'Qualified',
      badge: '2 Deals',
      cards: [
        { id: '4', title: 'Global CRM Rollout', company: 'Aero Dynamics', value: '$45,000', rep: 'Sarah K.', daysInStage: 5 },
        { id: '5', title: 'Regional Agent Pilot', company: 'Solstice Corp', value: '$12,000', rep: 'John D.', daysInStage: 4 },
      ],
    },
    {
      name: 'Proposal',
      badge: '2 Deals',
      cards: [
        { id: '6', title: 'Custom Ingestion Engine', company: 'Horizon Media', value: '$32,000', rep: 'Elena R.', daysInStage: 7 },
        { id: '7', title: 'High-Volume Stream Tier', company: 'Vanguard Ltd', value: '$28,500', rep: 'Marcus S.', daysInStage: 9 },
      ],
    },
    {
      name: 'Negotiation',
      badge: '1 Deal',
      cards: [
        { id: '8', title: 'Enterprise Annual Contract', company: 'Summit Capital', value: '$56,000', rep: 'Sarah K.', daysInStage: 12 },
      ],
    },
    {
      name: 'Won',
      badge: '1 Deal',
      cards: [
        { id: '9', title: 'Multi-Org License', company: 'Pinnacle Systems', value: '$72,000', rep: 'Marcus S.', daysInStage: 15 },
      ],
    },
  ];

  return (
    <section id="pipeline" className="py-20 bg-crm-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Visual Deal Execution
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            See Every Deal. Know Every Opportunity.
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            Track deals through clear qualification stages. Keep sales cycles short, eliminate stalls, and forecast with confidence.
          </p>
        </div>

        {/* Pipeline Container */}
        <div className="rounded-2xl border border-crm-border bg-white p-4 sm:p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-crm-border min-w-[900px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-crm-header">Active Q3 Sales Pipeline</span>
              <Badge variant="teal">Total Value: $297,200</Badge>
            </div>
            <div className="text-xs text-crm-muted flex items-center gap-1">
              <span>Drag & drop stages</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3.5 min-w-[900px]">
            {columns.map((col, idx) => {
              const isWon = col.name === 'Won';
              const isHovered = activeStage === idx;

              return (
                <div
                  key={col.name}
                  onMouseEnter={() => setActiveStage(idx)}
                  onMouseLeave={() => setActiveStage(null)}
                  className={`flex flex-col rounded-xl p-3 transition-colors ${
                    isHovered ? 'bg-teal-50/40 ring-1 ring-teal-400/40' : 'bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-crm-header">{col.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isWon ? 'bg-teal-100 text-crm-teal' : 'bg-slate-200/70 text-slate-700'
                    }`}>
                      {col.badge}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {col.cards.map((card) => (
                      <div
                        key={card.id}
                        className={`rounded-lg border bg-white p-3 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${
                          isWon ? 'border-teal-200/80' : 'border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-crm-header line-clamp-1">{card.title}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <Building className="h-3 w-3" />
                          <span className="line-clamp-1">{card.company}</span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                          <span className="font-extrabold text-crm-header flex items-center text-teal-700">
                            {card.value}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {card.daysInStage}d
                          </span>
                        </div>
                      </div>
                    ))}
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
