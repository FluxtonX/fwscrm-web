'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  fetchLeadStatuses,
  fetchLeadSources,
  fetchCountries,
  fetchLeads,
  downloadLeadsCsv,
  downloadSelectedLeadsCsv,
} from '@/features/leads/api';
import { fetchUsers } from '@/features/users/api';
import { QueryLeadsParams } from '@/features/leads/types';

interface ExportLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters?: QueryLeadsParams;
  selectedLeadIds?: string[];
  sourceContext?: 'table' | 'dashboard';
}

const AVAILABLE_COLUMNS = [
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'status', label: 'Status' },
  { id: 'country', label: 'Country' },
  { id: 'leadSource', label: 'Lead Source' },
  { id: 'referrer', label: 'Referrer' },
  { id: 'tag1', label: 'Tags' },
  { id: 'owner', label: 'Owner' },
  { id: 'createdAt', label: 'Created At' },
];

export function ExportLeadsModal({
  open,
  onOpenChange,
  initialFilters = {},
  selectedLeadIds = [],
  sourceContext = 'table',
}: ExportLeadsModalProps) {
  const toast = useToast();

  // Scope: 'selected' | 'filtered'
  const hasSelected = selectedLeadIds.length > 0;
  const [scope, setScope] = React.useState<'selected' | 'filtered'>(
    hasSelected ? 'selected' : 'filtered',
  );

  // Form Filter State
  const [status, setStatus] = React.useState<string>(initialFilters.status || '');
  const [country, setCountry] = React.useState<string>(initialFilters.country || '');
  const [source, setSource] = React.useState<string>(initialFilters.leadSource || '');
  const [ownerId, setOwnerId] = React.useState<string>(initialFilters.ownerId || '');
  const [search, setSearch] = React.useState<string>(initialFilters.search || '');
  const [timeframe, setTimeframe] = React.useState<string>('all');
  const [customDateFrom, setCustomDateFrom] = React.useState<string>('');
  const [customDateTo, setCustomDateTo] = React.useState<string>('');

  // Selected Columns
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>(
    AVAILABLE_COLUMNS.map((c) => c.id),
  );
  const [showColumnsPicker, setShowColumnsPicker] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Sync state whenever modal opens or initialFilters change
  React.useEffect(() => {
    if (open) {
      setStatus(initialFilters.status || '');
      setCountry(initialFilters.country || '');
      setSource(initialFilters.leadSource || '');
      setOwnerId(initialFilters.ownerId || '');
      setSearch(initialFilters.search || '');
      setScope(hasSelected ? 'selected' : 'filtered');
    }
  }, [open, initialFilters.status, initialFilters.country, initialFilters.leadSource, initialFilters.ownerId, initialFilters.search, hasSelected]);

  // Fetch Reference Data
  const { data: statuses = [] } = useQuery({
    queryKey: ['lead-statuses'],
    queryFn: fetchLeadStatuses,
    enabled: open,
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: fetchLeadSources,
    enabled: open,
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['lead-countries'],
    queryFn: fetchCountries,
    enabled: open,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-list-export'],
    queryFn: fetchUsers,
    enabled: open,
  });

  // Calculate actual Date Range strings based on timeframe
  const computedDateRange = React.useMemo(() => {
    const now = new Date();
    if (timeframe === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      return { dateFrom: todayStr, dateTo: todayStr };
    }
    if (timeframe === '7d') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: past.toISOString().slice(0, 10), dateTo: now.toISOString().slice(0, 10) };
    }
    if (timeframe === '30d') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: past.toISOString().slice(0, 10), dateTo: now.toISOString().slice(0, 10) };
    }
    if (timeframe === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { dateFrom: firstDay.toISOString().slice(0, 10), dateTo: now.toISOString().slice(0, 10) };
    }
    if (timeframe === 'custom') {
      return {
        dateFrom: customDateFrom || undefined,
        dateTo: customDateTo || undefined,
      };
    }
    return { dateFrom: undefined, dateTo: undefined };
  }, [timeframe, customDateFrom, customDateTo]);

  // Live Count Preview via React Query
  const { data: previewData, isFetching: isCounting } = useQuery({
    queryKey: [
      'export-lead-count',
      scope,
      status,
      country,
      source,
      ownerId,
      search,
      computedDateRange.dateFrom,
      computedDateRange.dateTo,
      selectedLeadIds,
    ],
    queryFn: () => {
      if (scope === 'selected') {
        return Promise.resolve({ meta: { total: selectedLeadIds.length } });
      }
      return fetchLeads({
        page: 1,
        limit: 1,
        status: status || undefined,
        country: country || undefined,
        leadSource: source || undefined,
        ownerId: ownerId || undefined,
        search: search || undefined,
        dateFrom: computedDateRange.dateFrom,
        dateTo: computedDateRange.dateTo,
      });
    },
    enabled: open,
    staleTime: 3000,
  });

  const estimatedTotal = scope === 'selected' ? selectedLeadIds.length : (previewData?.meta?.total ?? 0);

  const handleSelectAllColumns = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map((c) => c.id));
  };

  const handleDeselectAllColumns = () => {
    setSelectedColumns(['firstName', 'phone']);
  };

  const toggleColumn = (colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId],
    );
  };

  // Perform Export
  const handleExecuteExport = async () => {
    setIsExporting(true);
    try {
      const columnsParam =
        selectedColumns.length === AVAILABLE_COLUMNS.length
          ? undefined
          : selectedColumns.join(',');

      if (scope === 'selected' && selectedLeadIds.length > 0) {
        await downloadSelectedLeadsCsv(selectedLeadIds);
        toast.success(`Exported ${selectedLeadIds.length} selected leads successfully`);
      } else {
        await downloadLeadsCsv({
          status: status || undefined,
          country: country || undefined,
          leadSource: source || undefined,
          ownerId: ownerId || undefined,
          search: search || undefined,
          dateFrom: computedDateRange.dateFrom,
          dateTo: computedDateRange.dateTo,
          columns: columnsParam,
        });
        toast.success('Leads exported successfully');
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-xl p-0 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-crm-border bg-white shrink-0">
        <DialogHeader onClose={() => onOpenChange(false)} className="mb-0 pb-0 border-b-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#EAF3FA] flex items-center justify-center text-[#16C1C8] shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800">
                Export Leads to CSV
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your filter criteria and export matching records.
              </p>
            </div>
          </div>
        </DialogHeader>
      </div>

      {/* Scrollable Form Body */}
      <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
        {/* Scope Selector if rows are selected */}
        {hasSelected && (
          <div className="rounded-xl border border-crm-border bg-slate-50/80 p-3.5 space-y-2">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Export Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('selected')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  scope === 'selected'
                    ? 'bg-[#16C1C8] border-[#16C1C8] text-[#071A1D] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Selected Leads ({selectedLeadIds.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  scope === 'filtered'
                    ? 'bg-[#16C1C8] border-[#16C1C8] text-[#071A1D] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filtered Database
              </button>
            </div>
          </div>
        )}

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Status Selection Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 rounded-lg border border-crm-border bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal cursor-pointer"
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st.id} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Range */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full h-9 rounded-lg border border-crm-border bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Inputs if Custom is picked */}
          {timeframe === 'custom' && (
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2.5 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">From Date</label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full h-8.5 rounded-lg border border-crm-border bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">To Date</label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full h-8.5 rounded-lg border border-crm-border bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal"
                />
              </div>
            </div>
          )}

          {/* Owner Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Assigned Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full h-9 rounded-lg border border-crm-border bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal cursor-pointer"
            >
              <option value="">All Owners</option>
              <option value="unassigned">Unassigned Only</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-9 rounded-lg border border-crm-border bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal cursor-pointer"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source Filter */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Lead Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-9 rounded-lg border border-crm-border bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-crm-teal cursor-pointer"
            >
              <option value="">All Lead Sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collapsible Column Picker */}
        <div className="rounded-xl border border-crm-border bg-slate-50/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowColumnsPicker(!showColumnsPicker)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="h-3.5 w-3.5 text-crm-teal" />
              Customize CSV Columns ({selectedColumns.length}/{AVAILABLE_COLUMNS.length} selected)
            </span>
            {showColumnsPicker ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showColumnsPicker && (
            <div className="p-4 pt-1 border-t border-crm-border/70 space-y-3 bg-white animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100">
                <span className="text-slate-400">Toggle fields to include in export</span>
                <div className="flex gap-2 font-medium">
                  <button
                    type="button"
                    onClick={handleSelectAllColumns}
                    className="text-crm-teal hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllColumns}
                    className="text-slate-500 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_COLUMNS.map((col) => {
                  const isChecked = selectedColumns.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none py-1 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded border-slate-300 text-crm-teal focus:ring-crm-teal"
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer & Download Button - ALWAYS STICKY & VISIBLE */}
      <div className="px-6 py-4 border-t border-crm-border bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Ready to export:</span>
          <Badge
            variant="teal"
            className="px-2.5 py-0.5 text-xs font-bold bg-[#16C1C8]/20 text-[#0A2428] border border-[#16C1C8]/40"
          >
            {isCounting ? 'Counting...' : `${estimatedTotal} records`}
          </Badge>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
            className="h-9 px-4 text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleExecuteExport}
            isLoading={isExporting}
            className="h-9 px-5 bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] font-bold shadow-sm flex items-center gap-2 text-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
