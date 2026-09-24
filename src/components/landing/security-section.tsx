'use client';

import * as React from 'react';
import { Shield, KeyRound, Building2, Cloud, CheckCircle2 } from 'lucide-react';

export function SecuritySection() {
  const pillars = [
    {
      title: 'Secure Authentication',
      subtitle: 'Signed HttpOnly session cookies with cryptographic token rotation.',
      icon: KeyRound,
    },
    {
      title: 'Role-Based Access',
      subtitle: '5-tier hierarchical authorization guards protecting every operation.',
      icon: Shield,
    },
    {
      title: 'Multi-Tenant Architecture',
      subtitle: 'Query-level organization isolation ensuring complete database privacy.',
      icon: Building2,
    },
    {
      title: 'Cloud Infrastructure',
      subtitle: 'Serverless Neon PostgreSQL pooling and BullMQ asynchronous queues.',
      icon: Cloud,
    },
  ];

  return (
    <section id="security" className="py-16 bg-white border-b border-[#E1EBEB] text-[#071A1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
            <Shield className="h-3.5 w-3.5" /> Enterprise Trust
          </div>
          <h2 className="crm-section-title text-[#071A1D]">
            Built with uncompromising security.
          </h2>
        </div>

        {/* 4 Compact Visual Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-xl border border-[#E1EBEB] bg-[#F8FAFA] p-4 flex flex-col justify-between shadow-sm transition-all hover:border-[#16C1C8]/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 border border-teal-100 text-[#0D7F84]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h3 className="crm-card-title text-[#071A1D]">{pillar.title}</h3>
                  <p className="crm-caption text-[#4A6B6F] mt-1">
                    {pillar.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
