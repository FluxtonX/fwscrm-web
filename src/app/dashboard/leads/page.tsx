import { LeadsTable } from '@/features/leads/components/leads-table';

export const metadata = {
  title: 'Leads Management — FWS CRM',
  description: 'Manage, filter, search, and bulk update organization leads.',
};

export default function LeadsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-crm-header">
            Leads Management
          </h1>
          <p className="text-xs text-crm-muted mt-0.5">
            Real-time lead tracking, pipeline progression, and bulk operations.
          </p>
        </div>
      </div>

      <LeadsTable />
    </div>
  );
}
