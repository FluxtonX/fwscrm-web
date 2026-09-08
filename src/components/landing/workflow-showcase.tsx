'use client';

import * as React from 'react';
import { Zap, UserCheck, PhoneCall, FileText, Award, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function WorkflowShowcase() {
  const steps = [
    {
      step: '01',
      title: 'New Lead Ingestion',
      desc: 'Instant streaming CSV or direct API webhook with automated deduplication.',
      icon: Zap,
      status: 'Trigger',
      statusColor: 'text-[#16C1C8] border-[#16C1C8]/40 bg-[#16C1C8]/10',
    },
    {
      step: '02',
      title: 'Auto-Qualification',
      desc: 'Schema validation verifies email format, country code, and initial intent score.',
      icon: Sparkles,
      status: 'Filter',
      statusColor: 'text-sky-300 border-sky-400/40 bg-sky-400/10',
    },
    {
      step: '03',
      title: 'Assign Representative',
      desc: 'Round-robin routing assigns available sales rep by territory and workload.',
      icon: UserCheck,
      status: 'Routing',
      statusColor: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
    },
    {
      step: '04',
      title: 'Scheduled Follow-Up',
      desc: 'Task reminder generated; SLA tracking begins for first customer touchpoint.',
      icon: PhoneCall,
      status: 'Engagement',
      statusColor: 'text-indigo-300 border-indigo-400/40 bg-indigo-400/10',
    },
    {
      step: '05',
      title: 'Proposal Sent',
      desc: 'Deal terms compiled, value logged, and automated audit note recorded.',
      icon: FileText,
      status: 'Negotiation',
      statusColor: 'text-violet-300 border-violet-400/40 bg-violet-400/10',
    },
    {
      step: '06',
      title: 'Closed Won',
      desc: 'Contract finalized; revenue credited to quota and organization analytics.',
      icon: Award,
      status: 'Converted',
      statusColor: 'text-[#22D3DA] border-[#16C1C8]/50 bg-[#0D2D32]',
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-[#071A1D] border-b border-[#16454B] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16C1C8] uppercase tracking-wider mb-2">
            <Zap className="h-3.5 w-3.5" /> Smart Automation
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F1FAFA]">
            Automated lead progression.
          </h2>
          <p className="mt-2 text-sm text-[#91B7BA] font-normal">
            Eliminate manual handoffs with event-driven pipeline stages that guide leads from capture to close.
          </p>
        </div>

        {/* Visual Node Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div
                key={item.step}
                className="rounded-2xl border border-[#16454B] bg-[#0A2428] p-4 flex flex-col justify-between shadow-xl transition-all duration-200 hover:border-[#16C1C8]/60 hover:-translate-y-1 relative"
              >
                <div>
                  {/* Top Step & Status Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-[#91B7BA] font-semibold">{item.step}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="h-8 w-8 rounded-lg bg-[#0D2D32] border border-[#16454B] flex items-center justify-center text-[#16C1C8] mb-3">
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-xs font-semibold text-white leading-snug">{item.title}</h3>
                  <p className="text-[11px] text-[#91B7BA] mt-1.5 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom indicator */}
                <div className="mt-4 pt-2 border-t border-[#16454B] flex items-center justify-between text-[10px] text-[#91B7BA]">
                  <span>Step complete</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16C1C8]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
