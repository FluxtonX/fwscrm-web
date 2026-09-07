import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-crm-header py-20 text-white border-t border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/30 via-slate-900/0 to-slate-950 pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/70 px-3.5 py-1.5 text-xs font-semibold text-teal-300 mb-6">
          <ShieldCheck className="h-3.5 w-3.5 text-crm-teal" />
          Immediate Organization Provisioning
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Bring Your Customer Relationships <br className="hidden sm:inline" />
          <span className="text-crm-teal">Into One Place</span>
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Give your team the tools they need to ingest leads, close deals, and scale with complete operational clarity.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-crm-teal hover:bg-crm-teal-hover text-white shadow-lg px-8 py-6 text-base font-semibold"
            >
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-800 px-8 py-6 text-base font-semibold"
            >
              Sign In to Workspace
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          No credit card required • Instant setup • Secure Neon PostgreSQL backend
        </p>
      </div>
    </section>
  );
}
