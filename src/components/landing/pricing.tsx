'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoModal } from './demo-modal';

export function PricingSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for small sales teams needing reliable lead management and deduplication.',
      price: '$29',
      period: '/ agent / mo',
      highlighted: false,
      features: [
        'Up to 5 team seats',
        '10,000 active leads',
        'Streaming CSV file ingestion',
        'Basic duplicate detection',
        'Standard Kanban pipeline',
        'Email & community support',
      ],
      cta: 'Start Free Trial',
      href: '/register',
    },
    {
      name: 'Professional',
      description: 'Comprehensive lead lifecycle management and team collaboration for scaling organizations.',
      price: '$79',
      period: '/ agent / mo',
      highlighted: true,
      badge: 'Most Popular',
      features: [
        'Up to 25 team seats',
        '100,000 active leads',
        'High-volume streaming CSV queue',
        'Advanced duplicate prevention',
        'Custom status & source taxonomy',
        'Full activity timeline & notes',
        'Role-Based Access Control (RBAC)',
        'Priority SLA support',
      ],
      cta: 'Get Started Now',
      href: '/register',
    },
    {
      name: 'Enterprise',
      description: 'Custom infrastructure, dedicated database pooling, and limitless scale.',
      price: 'Custom',
      period: 'tailored to volume',
      highlighted: false,
      features: [
        'Unlimited team seats & roles',
        '500,000+ lead capacity',
        'Dedicated Neon Postgres pooling',
        'Custom sub-affiliate tracking',
        'Enterprise audit logging',
        'Dedicated solutions engineer',
        '99.99% uptime guarantee',
      ],
      cta: 'Talk to Sales',
      href: null, // triggers demo modal
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white border-b border-crm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Transparent Pricing
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Flexible Plans for Growing Teams
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            Choose the plan that fits your current volume. Upgrade seamlessly as your pipeline and sales operations expand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.highlighted
                  ? 'border-crm-teal shadow-lg ring-2 ring-crm-teal/20 bg-gradient-to-b from-teal-50/20 to-white'
                  : 'border-crm-border bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-crm-header">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-crm-teal px-3 py-0.5 text-xs font-semibold text-white shadow-xs">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-crm-muted mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-crm-header tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-crm-muted">{plan.period}</span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold text-crm-header uppercase tracking-wider mb-4">
                    Included capabilities:
                  </div>
                  <ul className="space-y-3 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-crm-teal shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                {plan.href ? (
                  <Link href={plan.href} className="block w-full">
                    <Button
                      className={`w-full font-semibold ${
                        plan.highlighted
                          ? 'bg-crm-teal hover:bg-crm-teal-hover text-white shadow'
                          : 'bg-crm-header hover:bg-slate-800 text-white'
                      }`}
                    >
                      {plan.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => setDemoOpen(true)}
                    variant="outline"
                    className="w-full font-semibold border-slate-300 hover:bg-slate-50 text-crm-header"
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
