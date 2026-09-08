'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoModal } from './demo-modal';

export function PricingSection() {
  const [demoOpen, setDemoOpen] = React.useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Core lead operations & contact management for agile sales teams.',
      price: '$29',
      period: '/ agent / mo',
      highlighted: false,
      features: [
        'Up to 5 team seats with RBAC',
        '10,000 active lead records',
        'Unified CSV & XLSX ingestion',
        'Real-time duplicate detection',
        'Standard 5-stage Kanban board',
      ],
      cta: 'Start Free Trial',
      href: '/register',
    },
    {
      name: 'Professional',
      description: 'Comprehensive lead lifecycle operations & telemetry for scaling teams.',
      price: '$79',
      period: '/ agent / mo',
      highlighted: true,
      badge: 'Most Popular',
      features: [
        'Up to 25 team seats with granular RBAC',
        '100,000 active lead records',
        'High-velocity streaming queue & XLSX parser',
        'Real-time PostgreSQL analytics & velocity',
        'Full activity audit trails & team logs',
        'Priority SLA support & round-robin routing',
      ],
      cta: 'Get Started Now',
      href: '/register',
    },
    {
      name: 'Enterprise',
      description: 'Dedicated database pooling, custom pipelines, and infinite scale.',
      price: 'Custom',
      period: 'tailored to volume',
      highlighted: false,
      features: [
        'Unlimited team seats & custom roles',
        '500,000+ lead capacity',
        'Dedicated Neon PostgreSQL pooling',
        'Sub-affiliate & custom source taxonomy',
        'Enterprise audit logging & 99.99% SLA',
      ],
      cta: 'Talk to Sales',
      href: null, // opens demo modal
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-[#F6F9F9] border-b border-[#E1EBEB] text-[#071A1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Minimalist Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Predictable Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#071A1D]">
            Simple plans that scale with your volume.
          </h2>
          <p className="mt-2 text-sm text-[#4A6B6F] font-normal">
            No hidden limits. Zero lock-in. Transparent pricing designed for growing sales operations.
          </p>
        </div>

        {/* 3 SaaS Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.highlighted
                  ? 'border-[#16C1C8] bg-[#071A1D] text-white shadow-2xl shadow-[#16C1C8]/20 ring-2 ring-[#16C1C8]/60 relative md:-translate-y-2'
                  : 'border-[#E1EBEB] bg-white text-[#071A1D] shadow-sm hover:border-[#16C1C8]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-semibold ${plan.highlighted ? 'text-white' : 'text-[#071A1D]'}`}>
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="rounded-full bg-[#16C1C8] px-2.5 py-0.5 text-[11px] font-semibold text-[#071A1D] shadow-sm">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs mb-6 leading-relaxed font-normal ${plan.highlighted ? 'text-[#91B7BA]' : 'text-[#4A6B6F]'}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-semibold tracking-tight ${plan.highlighted ? 'text-white' : 'text-[#071A1D]'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs ${plan.highlighted ? 'text-[#91B7BA]' : 'text-[#4A6B6F]'}`}>{plan.period}</span>
                </div>

                <div className={`pt-4 border-t ${plan.highlighted ? 'border-[#16454B]' : 'border-slate-100'}`}>
                  <div className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${plan.highlighted ? 'text-[#22D3DA]' : 'text-[#0D7F84]'}`}>
                    Included capabilities:
                  </div>
                  <ul className={`space-y-2.5 text-xs ${plan.highlighted ? 'text-slate-200' : 'text-slate-700'}`}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#16C1C8]' : 'text-[#0D7F84]'}`} />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={`mt-8 pt-6 border-t ${plan.highlighted ? 'border-[#16454B]' : 'border-slate-100'}`}>
                {plan.href ? (
                  <Link href={plan.href} className="block w-full">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      className={`w-full font-semibold transition-all ${
                        plan.highlighted
                          ? 'bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] shadow-lg shadow-[#16C1C8]/25 border-none'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {plan.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setDemoOpen(true)}
                    className="w-full font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
