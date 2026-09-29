'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  UploadCloud,
  Download,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  RotateCcw,
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Calendar,
  Tag,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/auth-context';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  fetchLeads,
  fetchLeadStatuses,
  fetchLeadSources,
  fetchCountries,
  deleteLead,
  downloadLeadsCsv,
  downloadSelectedLeadsCsv,
} from '../api';
import {
  Lead,
  LeadStatus,
  LeadSource,
  Country,
  PaginatedLeadsResponse,
} from '../types';
import { CreateLeadModal } from './create-lead-modal';
import { EditLeadModal } from './edit-lead-modal';
import { LeadDetailModal } from './lead-detail-modal';
import { LeadHealthBadge } from './lead-health-badge';
import {
  BulkStatusModal,
  BulkDeleteDialog,
  BulkAssignModal,
  BulkTagModal,
  BulkEditModal,
} from './bulk-modals';
import { CountryFlag } from './country-flag';
import { ExportLeadsModal } from './export-leads-modal';

export function LeadsTable() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();

  // Query state
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(25);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [presetTab, setPresetTab] = React.useState(() => searchParams?.get('preset') || 'all');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [countryFilter, setCountryFilter] = React.useState('');
  const [sourceFilter, setSourceFilter] = React.useState('');
  const [sortField, setSortField] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // UI & Selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [showColumnMenu, setShowColumnMenu] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({
    name: true,
    email: true,
    phone: true,
    company: true,
    status: true,
    health: true,
    country: true,
    source: true,
    createdAt: true,
  });

  // Modal states
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editLead, setEditLead] = React.useState<Lead | null>(null);
  const [detailLead, setDetailLead] = React.useState<Lead | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = React.useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = React.useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = React.useState(false);
  const [bulkTagOpen, setBulkTagOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // TanStack Queries with High-Performance Caching & Zero-Flicker Transitions
  const {
    data: leadsData,
    isLoading: isInitialLoading,
    isFetching,
    isPlaceholderData,
  } = useQuery<PaginatedLeadsResponse>({
    queryKey: [
      'leads',
      {
        page,
        limit,
        search: debouncedSearch,
        preset: presetTab,
        status: statusFilter,
        country: countryFilter,
        source: sourceFilter,
        sortField,
        sortOrder,
      },
    ],
    queryFn: () =>
      fetchLeads({
        page,
        limit,
        search: debouncedSearch,
        preset: presetTab,
        status: statusFilter,
        country: countryFilter,
        leadSource: sourceFilter,
        sort: sortField,
        order: sortOrder,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds fresh cache
  });

  // Reference lookups cached for 5-10 minutes to avoid redundant HTTP requests
  const { data: statuses = [] } = useQuery<LeadStatus[]>({
    queryKey: ['lead-statuses'],
    queryFn: fetchLeadStatuses,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sources = [] } = useQuery<LeadSource[]>({
    queryKey: ['lead-sources'],
    queryFn: fetchLeadSources,
    staleTime: 5 * 60 * 1000,
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 10 * 60 * 1000,
  });

  // Intelligent Background Prefetching: Prefetch next page so clicking 'Next' is instantaneous (0ms)
  React.useEffect(() => {
    if (leadsData?.meta && page < leadsData.meta.totalPages) {
      queryClient.prefetchQuery({
        queryKey: [
          'leads',
          {
            page: page + 1,
            limit,
            search: debouncedSearch,
            preset: presetTab,
            status: statusFilter,
            country: countryFilter,
            source: sourceFilter,
            sortField,
            sortOrder,
          },
        ],
        queryFn: () =>
          fetchLeads({
            page: page + 1,
            limit,
            search: debouncedSearch,
            preset: presetTab,
            status: statusFilter,
            country: countryFilter,
            leadSource: sourceFilter,
            sort: sortField,
            order: sortOrder,
          }),
        staleTime: 30 * 1000,
      });
    }
  }, [
    leadsData,
    page,
    limit,
    debouncedSearch,
    presetTab,
    statusFilter,
    countryFilter,
    sourceFilter,
    sortField,
    sortOrder,
    queryClient,
  ]);

  const loadLeads = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-payload'] });
  }, [queryClient]);

  // Next / Prev Lead Navigation for Detail Panel (fast in-memory navigation)
  const currentDetailIndex = React.useMemo(() => {
    if (!detailLead || !leadsData?.data) return -1;
    return leadsData.data.findIndex((l) => l.id === detailLead.id);
  }, [detailLead, leadsData?.data]);

  const hasPrevLead = currentDetailIndex > 0;
  const hasNextLead =
    currentDetailIndex !== -1 &&
    !!leadsData?.data &&
    currentDetailIndex < leadsData.data.length - 1;

  const handlePrevLead = React.useCallback(() => {
    if (leadsData?.data && currentDetailIndex > 0) {
      setDetailLead(leadsData.data[currentDetailIndex - 1]);
    }
  }, [leadsData?.data, currentDetailIndex]);

  const handleNextLead = React.useCallback(() => {
    if (
      leadsData?.data &&
      currentDetailIndex !== -1 &&
      currentDetailIndex < leadsData.data.length - 1
    ) {
      setDetailLead(leadsData.data[currentDetailIndex + 1]);
    }
  }, [leadsData?.data, currentDetailIndex]);

  // Handle Sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Synchronize URL search params (e.g. /dashboard/leads?preset=upcoming&leadId=123)
  React.useEffect(() => {
    const p = searchParams?.get('preset');
    if (p) {
      setPresetTab(p);
    }
    const targetLeadId = searchParams?.get('leadId');
    if (targetLeadId && leadsData?.data) {
      const found = leadsData.data.find((l) => l.id === targetLeadId);
      if (found) {
        setDetailLead(found);
      }
    }
  }, [searchParams, leadsData]);

  // Selection handlers
  const handleSelectAll = () => {
    if (!leadsData?.data) return;
    if (selectedIds.length === leadsData.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leadsData.data.map((l) => l.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Row deletion
  const handleDeleteRow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      toast.success('Lead deleted');
      loadLeads();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete lead');
    }
  };

  // Open CSV Export modal with active filters / selection
  const handleExport = () => {
    setExportModalOpen(true);
  };

  // Open CSV Export modal for selected leads
  const handleExportSelected = () => {
    setExportModalOpen(true);
  };

  const isAllSelected =
    leadsData?.data &&
    leadsData.data.length > 0 &&
    selectedIds.length === leadsData.data.length;

  const canDelete =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER';

  return (
    <div className="space-y-4 select-none">
      {/* Phase 4: Smart Filter Presets Bar */}
      <div className="flex items-center gap-1.5 border-b border-crm-border pb-3 overflow-x-auto select-none">
        {[
          { id: 'all', label: 'All Leads', icon: Users },
          { id: 'my_leads', label: 'My Leads', icon: UserCheck },
          { id: 'follow_up_today', label: 'Follow-Up Today', icon: Clock },
          { id: 'overdue', label: 'Overdue Follow-ups', icon: AlertTriangle },
          { id: 'upcoming', label: 'Upcoming Follow-ups', icon: Clock },
          { id: 'unassigned', label: 'Unassigned', icon: Filter },
          { id: 'recent', label: 'Recently Added', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = presetTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setPresetTab(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#16C1C8] text-[#071A1D] shadow-xs'
                  : 'bg-white border border-crm-border text-crm-muted hover:text-crm-text hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#071A1D]' : 'text-crm-muted'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Action Toolbar */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-crm-border bg-white p-4 shadow-sm">
        {/* Left: Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-crm-border bg-white pl-9 pr-3 text-xs text-crm-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-crm-primary shadow-sm"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View Settings (Column visibility toggle) */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-crm-muted" />
              View Settings
            </Button>

            {showColumnMenu && (
              <div className="absolute right-0 mt-2 z-50 w-48 rounded-lg border border-crm-border bg-white p-2 shadow-lg text-xs">
                <div className="font-semibold text-slate-700 px-2 py-1 border-b border-slate-100 mb-1">
                  Toggle Columns
                </div>
                {Object.entries(visibleColumns).map(([col, isVisible]) => (
                  <label
                    key={col}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer capitalize text-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col]: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-crm-teal focus:ring-crm-teal"
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleExport} isLoading={isExporting}>
            <Download className="h-3.5 w-3.5 mr-1.5 text-crm-muted" />
            Export
          </Button>

          <Link href="/dashboard/imports">
            <Button variant="outline" size="sm">
              <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-crm-muted" />
              Import
            </Button>
          </Link>

          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-crm-border bg-white px-4 py-2.5 shadow-sm text-xs">
        <span className="font-semibold text-crm-text flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </span>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-8 rounded border border-crm-border bg-slate-50 px-2.5 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-primary"
        >
          <option value="">All Statuses</option>
          {statuses.map((st) => (
            <option key={st.id} value={st.name}>
              {st.name}
            </option>
          ))}
        </select>

        {/* Country filter */}
        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setPage(1);
          }}
          className="h-8 rounded border border-crm-border bg-slate-50 px-2.5 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-primary"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Lead Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          className="h-8 rounded border border-crm-border bg-slate-50 px-2.5 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-primary"
        >
          <option value="">All Sources</option>
          {sources.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {(statusFilter || countryFilter || sourceFilter || search) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setCountryFilter('');
              setSourceFilter('');
              setSearch('');
              setPage(1);
            }}
            className="ml-auto inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Bulk Action Bar (Visible when 1+ rows selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-[#0A2428] border border-[#0D2D32] px-4 py-2.5 text-xs animate-in fade-in shadow-md">
          <div className="flex items-center gap-2 font-medium text-slate-200">
            <span className="font-semibold text-[#16C1C8]">{selectedIds.length}</span> leads selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setBulkEditOpen(true)}
              className="bg-[#16C1C8] hover:bg-[#16C1C8]/90 text-[#071A1D] font-semibold border-none shadow-sm flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#071A1D]" />
              Bulk Edit
            </Button>
            <div className="h-4 w-px bg-slate-700/60 mx-0.5 hidden sm:block" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkStatusOpen(true)}
              className="bg-[#0D2D32] border-[#16C1C8]/30 text-white hover:bg-[#16C1C8]/20 hover:text-[#22D3DA]"
            >
              Update Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkAssignOpen(true)}
              className="bg-[#0D2D32] border-[#16C1C8]/30 text-white hover:bg-[#16C1C8]/20 hover:text-[#22D3DA]"
            >
              Assign Owner
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkTagOpen(true)}
              className="bg-[#0D2D32] border-[#16C1C8]/30 text-white hover:bg-[#16C1C8]/20 hover:text-[#22D3DA]"
            >
              <Tag className="h-3.5 w-3.5 mr-1 text-crm-teal" />
              Tag Leads
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportSelected}
              isLoading={isExporting}
              className="bg-[#0D2D32] border-[#16C1C8]/30 text-white hover:bg-[#16C1C8]/20 hover:text-[#22D3DA]"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export Selected
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                Delete Selected
              </Button>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white ml-2 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Leads Table Container */}
      <div className="overflow-hidden rounded-xl border border-crm-border bg-white shadow-sm relative">
        {/* Subtle background fetching indicator (smooth zero-flicker loading) */}
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-crm-teal/40 via-crm-teal to-crm-teal/40 animate-pulse z-10" />
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-crm-text border-collapse">
            {/* Table Header matching CRM visual design */}
            <thead className="bg-[#F0F6F6] text-slate-700 font-semibold border-b border-crm-border select-none text-xs">
              <tr>
                {/* Selection Checkbox */}
                <th className="w-10 px-3 py-3 text-center">
                  <button onClick={handleSelectAll} className="mt-0.5 text-slate-400 hover:text-crm-teal">
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4 text-crm-teal" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>

                {/* Name */}
                <th
                  onClick={() => handleSort('firstName')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    {sortField === 'firstName' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5 text-crm-teal" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-crm-teal" />
                      ))}
                  </div>
                </th>

                {/* Email */}
                <th
                  onClick={() => handleSort('email')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    {sortField === 'email' &&
                      (sortOrder === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5 text-crm-teal" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-crm-teal" />
                      ))}
                  </div>
                </th>

                {/* Phone */}
                {visibleColumns.phone && (
                  <th className="px-4 py-3">Phone</th>
                )}

                {/* Country */}
                {visibleColumns.country && (
                  <th
                    onClick={() => handleSort('countryName')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Country</span>
                      {sortField === 'countryName' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-crm-teal" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-crm-teal" />
                        ))}
                    </div>
                  </th>
                )}

                {/* Status */}
                {visibleColumns.status && (
                  <th className="px-4 py-3">Status</th>
                )}

                {/* Lead Source */}
                {visibleColumns.source && (
                  <th
                    onClick={() => handleSort('sourceName')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Source</span>
                      {sortField === 'sourceName' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-crm-teal" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-crm-teal" />
                        ))}
                    </div>
                  </th>
                )}

                {/* Referrer */}
                {visibleColumns.referrer && (
                  <th className="px-4 py-3">Referrer</th>
                )}

                {/* Tag 1 */}
                {visibleColumns.tag1 && (
                  <th className="px-4 py-3">Tag</th>
                )}

                {/* Owner */}
                {visibleColumns.owner && (
                  <th className="px-4 py-3">Owner</th>
                )}

                {/* Health / Priority */}
                {visibleColumns.health && (
                  <th className="px-4 py-3">Health</th>
                )}

                {/* Actions */}
                <th className="w-12 px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody
              className={`divide-y divide-crm-border transition-opacity duration-150 ${
                isFetching && isPlaceholderData ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {isInitialLoading && !leadsData ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-crm-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span>Loading leads from server...</span>
                    </div>
                  </td>
                </tr>
              ) : leadsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8">
                    <EmptyState
                      title="No leads found"
                      description={
                        search || statusFilter || countryFilter || sourceFilter
                          ? 'No leads matched your filter criteria. Try resetting filters.'
                          : 'Your lead database is currently empty. Add your first lead or import a CSV file.'
                      }
                      actionLabel="Add Lead"
                      onAction={() => setCreateModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                leadsData?.data.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={(e) => {
                        // Ignore clicks on buttons, links, inputs, or actions dropdowns
                        const target = e.target as HTMLElement;
                        if (target.closest('button, a, input, [role="menuitem"], .no-row-click')) {
                          return;
                        }
                        // If the user has highlighted text (dragged mouse to select), do not toggle row selection
                        const selection = window.getSelection();
                        if (selection && selection.toString().trim().length > 0) {
                          return;
                        }
                        handleSelectRow(lead.id);
                      }}
                      className={`cursor-pointer hover:bg-crm-table-row-hover transition-colors ${
                        isSelected ? 'bg-[#16C1C8]/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="w-10 px-3 py-2.5 text-center no-row-click"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleSelectRow(lead.id)}
                          className="text-slate-400 hover:text-crm-teal p-0.5 rounded transition-colors"
                          title={isSelected ? 'Deselect row' : 'Select row'}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-crm-teal" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-2.5 font-semibold text-crm-header whitespace-nowrap select-text text-sm">
                        <span className="select-text hover:text-crm-teal transition-colors">
                          {lead.firstName} {lead.lastName}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap select-text text-[13px]">
                        <span className="select-text">{lead.email}</span>
                      </td>

                      {/* Phone */}
                      {visibleColumns.phone && (
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap select-text text-[13px]">
                          <span className="select-text">{lead.phone || '—'}</span>
                        </td>
                      )}

                      {/* Country */}
                      {visibleColumns.country && (
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap select-text text-[13px]">
                          <CountryFlag countryName={lead.countryName} isoCode={lead.country?.isoCode} />
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="px-4 py-2.5 whitespace-nowrap select-text text-xs">
                          {lead.status ? (
                            <Badge
                              variant="default"
                              style={{
                                backgroundColor: `${lead.status.color}15`,
                                color: lead.status.color,
                                borderColor: `${lead.status.color}35`,
                              }}
                            >
                              {lead.status.name}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Lead Source */}
                      {visibleColumns.source && (
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap select-text text-xs">
                          {lead.sourceName ? (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {lead.sourceName}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}

                      {/* Referrer */}
                      {visibleColumns.referrer && (
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap select-text text-[13px]">
                          <span className="select-text">{lead.referrer || '—'}</span>
                        </td>
                      )}

                      {/* Tag 1 */}
                      {visibleColumns.tag1 && (
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap select-text text-xs">
                          {lead.tag1 ? (
                            <span className="rounded bg-teal-50 text-crm-teal border border-teal-100 px-2 py-0.5 text-[11px] font-medium">
                              {lead.tag1}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}

                      {/* Owner */}
                      {visibleColumns.owner && (
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap select-text text-[13px]">
                          {lead.owner ? (
                            <span className="select-text font-medium">
                              {lead.owner.firstName} {lead.owner.lastName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                      )}

                      {/* Health / Priority */}
                      {visibleColumns.health && (
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <LeadHealthBadge lead={lead} compact />
                        </td>
                      )}

                      {/* Row Actions */}
                      <td
                        className="w-12 px-3 py-2.5 text-right whitespace-nowrap no-row-click"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailLead(lead);
                            }}
                            title="View Lead Details"
                            className="p-1 rounded text-slate-400 hover:text-crm-teal hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditLead(lead);
                            }}
                            title="Edit Lead"
                            className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRow(lead.id);
                              }}
                              title="Delete Lead"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Footer */}
        {leadsData && leadsData.meta.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-crm-border bg-slate-50/60 px-4 py-3 text-xs text-crm-muted gap-3">
            <div className="flex items-center gap-4">
              <span>
                Showing{' '}
                <span className="font-semibold text-crm-text">
                  {(leadsData.meta.page - 1) * leadsData.meta.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-crm-text">
                  {Math.min(
                    leadsData.meta.page * leadsData.meta.limit,
                    leadsData.meta.total,
                  )}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-crm-text">
                  {leadsData.meta.total}
                </span>{' '}
                leads
              </span>

              {/* Limit selector */}
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-crm-border bg-white px-2 py-1 text-xs text-crm-text focus:outline-none focus:ring-1 focus:ring-crm-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-crm-text">
                Page {leadsData.meta.page} of {leadsData.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= leadsData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateLeadModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={loadLeads}
        statuses={statuses}
        sources={sources}
        countries={countries}
      />

      <EditLeadModal
        lead={editLead}
        open={!!editLead}
        onOpenChange={(open) => !open && setEditLead(null)}
        onSuccess={loadLeads}
        statuses={statuses}
        sources={sources}
        countries={countries}
      />

      <LeadDetailModal
        lead={detailLead}
        open={!!detailLead}
        onOpenChange={(open) => !open && setDetailLead(null)}
        onEdit={(l) => {
          setDetailLead(null);
          setEditLead(l);
        }}
        onPrev={handlePrevLead}
        onNext={handleNextLead}
        hasPrev={hasPrevLead}
        hasNext={hasNextLead}
      />

      <BulkEditModal
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedIds={selectedIds}
        statuses={statuses}
        onSuccess={(keepSelection) => {
          if (!keepSelection) {
            setSelectedIds([]);
          }
          loadLeads();
        }}
      />

      <BulkStatusModal
        open={bulkStatusOpen}
        onOpenChange={setBulkStatusOpen}
        selectedIds={selectedIds}
        statuses={statuses}
        onSuccess={() => {
          loadLeads();
        }}
      />

      <BulkAssignModal
        open={bulkAssignOpen}
        onOpenChange={setBulkAssignOpen}
        selectedIds={selectedIds}
        onSuccess={() => {
          loadLeads();
        }}
      />

      <BulkTagModal
        open={bulkTagOpen}
        onOpenChange={setBulkTagOpen}
        selectedIds={selectedIds}
        onSuccess={() => {
          loadLeads();
        }}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        selectedIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          loadLeads();
        }}
      />

      <ExportLeadsModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        initialFilters={{
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          country: countryFilter || undefined,
          leadSource: sourceFilter || undefined,
        }}
        selectedLeadIds={selectedIds}
        sourceContext="table"
      />
    </div>
  );
}
