import { Users, FileText, CheckCircle2, UserCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TeamShowcase() {
  const activities = [
    {
      time: '09:42 AM',
      user: 'Sarah Jenkins',
      role: 'Account Executive',
      action: 'Updated Acme Corp deal stage to Proposal ($32,000)',
      icon: FileText,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      time: '10:15 AM',
      user: 'John Doe',
      role: 'Sales Representative',
      action: 'Added call note: Client confirmed procurement review scheduled for Friday',
      icon: MessageSquare,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      time: '11:03 AM',
      user: 'System Ingestion',
      role: 'Automated Worker',
      action: 'High-volume batch import parsed 500 records with zero validation errors',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      time: '01:25 PM',
      user: 'Marcus Sterling',
      role: 'Sales Director',
      action: 'Reassigned 45 uncontacted regional leads to West Coast SDR team',
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <section id="team" className="py-20 bg-crm-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Collaborative Execution
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Keep Your Entire Team Aligned
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            Ensure every customer touchpoint, note, and assignment is transparent and audit-ready across the whole organization.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-crm-border bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-crm-border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-crm-teal" />
              <span className="font-bold text-base text-crm-header">Chronological Organization Timeline</span>
            </div>
            <Badge variant="outline">Audit Log Enabled</Badge>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ring-2 ring-slate-100 ${item.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-crm-header">{item.user}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({item.role})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      {item.action}
                    </p>
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
