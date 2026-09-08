import { FileSpreadsheet, Database, ArrowRight, Clock, Webhook, CloudUpload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function IntegrationsSection() {
  const plannedIntegrations = [
    { name: 'REST Webhooks API', status: 'Coming Soon', desc: 'Trigger real-time lead ingestion from marketing landing pages.' },
    { name: 'Cloud Object Storage', status: 'Coming Soon', desc: 'Direct ingestion from Cloudflare R2 / AWS S3 buckets.' },
    { name: 'Lead Distribution Feeds', status: 'Coming Soon', desc: 'Automated syndicated lead routing across affiliate networks.' },
  ];

  return (
    <section className="py-20 bg-crm-background border-b border-crm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#16C1C8]">
            Ingestion & Ecosystem
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-crm-header sm:text-4xl">
            Streamlined Ingestion Engine
          </h2>
          <p className="mt-4 text-sm sm:text-base text-crm-muted font-normal">
            High-performance streaming engine built for massive lead files, with extensible enterprise connectors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Production Engine */}
          <div className="lg:col-span-2 rounded-2xl border border-[#16C1C8]/40 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16C1C8]/10 text-[#16C1C8]">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <Badge variant="teal" className="bg-[#16C1C8]/15 text-[#071A1D] border-[#16C1C8]/30 font-semibold">
                  Production Ready
                </Badge>
              </div>

              <h3 className="text-xl font-semibold text-crm-header">High-Volume Streaming CSV Ingestion</h3>
              <p className="mt-2 text-sm text-crm-muted font-normal">
                Our streaming parser processes multi-thousand row files in real-time batches without memory leaks. Includes row-level validation and instant deduplication against your tenant database.
              </p>

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-700 mb-2">Native Supported Schema:</div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-600">
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">First Name</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Last Name</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Email</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Phone</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Country</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Lead Source</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">referrer</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">tag1</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#16C1C8] font-semibold">
              <span>Automatic duplicate email detection included</span>
              <CloudUpload className="h-4 w-4" />
            </div>
          </div>

          {/* Planned Roadmap Connectors */}
          <div className="rounded-2xl border border-crm-border bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Webhook className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Roadmap
                </span>
              </div>

              <h3 className="text-xl font-semibold text-crm-header">Upcoming Connectors</h3>
              <p className="mt-2 text-xs text-crm-muted font-normal">
                Extensible webhook infrastructure scheduled for future CRM releases.
              </p>

              <div className="mt-6 space-y-3">
                {plannedIntegrations.map((item) => (
                  <div key={item.name} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                      <span className="text-[9px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-normal">
              Built on modular NestJS architecture.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
