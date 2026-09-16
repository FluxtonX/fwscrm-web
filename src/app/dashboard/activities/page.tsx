'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  MessageSquare,
  UploadCloud,
  FileEdit,
  Trash2,
  AlertCircle,
  Eye,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchDashboard } from '@/features/analytics/api';

export default function ActivitiesPage() {
  const [search, setSearch] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('ALL');

  const {
    data: dashboard,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-payload', '30d'],
    queryFn: () => fetchDashboard('30d'),
    staleTime: 1000 * 60 * 2,
  });

  // Filter activities by type & search
  const filteredActivities = React.useMemo(() => {
    const list = dashboard?.recentActivities ?? [];
    return list.filter((act) => {
      // Type match
      if (selectedType !== 'ALL' && act.type !== selectedType) {
        return false;
      }
      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const descMatch = act.description.toLowerCase().includes(q);
        const userMatch = act.user
          ? `${act.user.firstName} ${act.user.lastName} ${act.user.email}`.toLowerCase().includes(q)
          : false;
        const leadMatch = act.lead
          ? `${act.lead.firstName} ${act.lead.lastName} ${act.lead.email}`.toLowerCase().includes(q)
          : false;
        return descMatch || userMatch || leadMatch;
      }
      return true;
    });
  }, [dashboard?.recentActivities, selectedType, search]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGED':
        return <FileEdit className="h-4 w-4 text-sky-600" />;
      case 'NOTE_ADDED':
        return <MessageSquare className="h-4 w-4 text-teal-600" />;
      case 'OWNER_ASSIGNED':
        return <UserCheck className="h-4 w-4 text-indigo-600" />;
      case 'IMPORTED':
        return <UploadCloud className="h-4 w-4 text-emerald-600" />;
      case 'CREATED':
        return <PlusCircle className="h-4 w-4 text-emerald-600" />;
      case 'DELETED':
        return <Trash2 className="h-4 w-4 text-rose-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const activityTypes = [
    { id: 'ALL', label: 'All Activities' },
    { id: 'STATUS_CHANGED', label: 'Status Updates' },
    { id: 'NOTE_ADDED', label: 'Notes & Comments' },
    { id: 'OWNER_ASSIGNED', label: 'Assignments' },
    { id: 'CREATED', label: 'Lead Creations' },
    { id: 'IMPORTED', label: 'CSV Ingestions' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 p-2.5 text-crm-teal">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-crm-header">
              Activity & Audit Stream
            </h1>
            <p className="text-xs text-crm-muted">
              Live chronological timeline of team actions, lead transitions, and operational audits.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin text-crm-teal' : 'text-crm-muted'}`} />
          Refresh Stream
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-xl border border-crm-border bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user, lead, or action details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {activityTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === t.id
                  ? 'bg-[#16C1C8] text-[#071A1D] font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-crm-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-crm-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-crm-teal" />
            <h2 className="text-sm font-bold text-crm-header">Audit Events</h2>
            <Badge variant="teal" className="text-[10px]">
              {filteredActivities.length} Events
            </Badge>
          </div>
          <span className="text-[11px] text-crm-muted">Auto-recorded actions</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-crm-muted">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-crm-teal" />
            Loading organization activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-crm-muted">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">No activity events found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 flex items-start justify-between hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 rounded-lg bg-slate-100 p-2 shrink-0">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-crm-header leading-snug">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>
                        By{' '}
                        <strong className="text-slate-700 font-medium">
                          {act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System Engine'}
                        </strong>
                      </span>

                      {act.lead && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>
                            Lead:{' '}
                            <Link
                              href="/dashboard/leads"
                              className="text-crm-teal font-medium hover:underline inline-flex items-center gap-0.5"
                            >
                              {act.lead.firstName} {act.lead.lastName}
                            </Link>
                          </span>
                        </>
                      )}

                      <span className="text-slate-300">•</span>
                      <Badge variant="default" className="text-[9px] py-0 px-1.5 uppercase font-mono bg-slate-100 text-slate-600 border-slate-200">
                        {act.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(act.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <Link href="/dashboard/leads">
                    <button
                      title="Inspect in Leads"
                      className="p-1 rounded text-slate-400 hover:text-crm-teal transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
