import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function ProblemSolutionSection() {
  const problems = [
    'Customer records fragmented across disconnected spreadsheets',
    'High duplicate rate causing conflicting outreach and burned leads',
    'No visibility into stage transitions or sales pipeline velocity',
    'Slow and error-prone manual CSV imports that crash browser tabs',
    'Unregulated access with lack of tenant security or audit logs',
  ];

  const solutions = [
    'Centralized relational database with authoritative ownership & tags',
    'Real-time automated duplicate email detection and row validation',
    'Clear 5-stage sales funnel with instant pipeline progression',
    'High-volume streaming CSV ingestion engine built on chunked queues',
    'Strict multi-tenant isolation, signed HttpOnly cookies, and RBAC',
  ];

  return (
    <section className="py-20 bg-crm-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-crm-header sm:text-4xl">
            Stop Managing Customer Relationships <br />
            <span className="text-rose-600">Across Scattered Tools</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-crm-muted font-normal">
            Spreadsheets fail as your lead volume explodes. FWS CRM delivers unified operations from initial CSV ingestion to closed deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* The Broken Way */}
          <div className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-semibold text-rose-700 mb-4">
                <XCircle className="h-4 w-4" /> Traditional Spreadsheet Chaos
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">The Fragmented Approach</h3>
              <p className="text-xs text-slate-500 mb-6 font-normal">
                Manual workflows degrade quickly, wasting sales bandwidth and losing high-value prospects.
              </p>

              <ul className="space-y-4">
                {problems.map((problem, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-100 text-xs text-rose-600 font-medium">
              Result: Lost revenue, untracked attribution, and frustrated reps.
            </div>
          </div>

          {/* The FWS CRM Way */}
          <div className="rounded-2xl border border-[#16C1C8]/40 bg-[#0A2428] text-white p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#16C1C8]/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0D2D32] border border-[#16C1C8]/30 px-3.5 py-1 text-xs font-semibold text-[#22D3DA] mb-4">
                <CheckCircle2 className="h-4 w-4 text-[#16C1C8]" /> Everything in One Place
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">The FWS CRM Standard</h3>
              <p className="text-xs text-slate-300 mb-6 font-normal">
                Architected from the ground up for high reliability, data integrity, and pipeline clarity.
              </p>

              <ul className="space-y-4">
                {solutions.map((solution, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-[#16C1C8] shrink-0 mt-0.5" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#0D2D32] text-xs text-[#22D3DA] font-semibold flex items-center justify-between">
              <span>Result: Seamless operations, clean audits, and maximized revenue.</span>
              <ArrowRight className="h-4 w-4 text-[#16C1C8]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
