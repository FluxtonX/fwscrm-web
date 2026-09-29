'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UploadCloud,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Download,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  PhoneCall,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { fetchDashboard } from '@/features/analytics/api';
import {
  fetchLeadStatuses,
  fetchLeadSources,
  fetchCountries,
  downloadLeadsCsv,
} from '@/features/leads/api';
import { CreateLeadModal } from '@/features/leads/components/create-lead-modal';
import { ExportLeadsModal } from '@/features/leads/components/export-leads-modal';

export default function DashboardPage() {
  const { user, organization } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Timeframe state: today | 7d | 30d | month | all
  const [timeframe, setTimeframe] = React.useState('30d');
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = React.useState<number | null>(null);
  const [showAllStages, setShowAllStages] = React.useState(false);

  // Dynamic greeting based on current hour
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Fetch consolidated dashboard payload
  const {
    data: dashboard,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['dashboard-payload', timeframe],
    queryFn: () => fetchDashboard(timeframe),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch reference metadata for CreateLeadModal
  const { data: statuses = [] } = useQuery({
    queryKey: ['lead-statuses'],
    queryFn: fetchLeadStatuses,
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: fetchLeadSources,
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['lead-countries'],
    queryFn: fetchCountries,
  });

  const handleExportData = () => {
    setExportModalOpen(true);
  };

  const overview = dashboard?.overview;
  const pipeline = dashboard?.pipeline ?? [];
  const visiblePipeline = showAllStages ? pipeline : pipeline.slice(0, 6);
  const sourceAttribution = dashboard?.sources ?? [];
  const trends = dashboard?.trends ?? [];
  const team = dashboard?.teamPerformance ?? [];
  const actionItems = dashboard?.actionItems;
  const recentLeads = dashboard?.recentLeads ?? [];
  const recentActivities = dashboard?.recentActivities ?? [];
  const insights = dashboard?.insights ?? [];

  // SVG Trend Chart Dimensions & Calculations
  const maxTrendValue = Math.max(...trends.map((t) => t.count), 1);
  const chartWidth = 640;
  const chartHeight = 160;
  const paddingX = 20;
  const paddingY = 20;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const points = trends.map((t, idx) => {
    const x =
      trends.length > 1
        ? paddingX + (idx / (trends.length - 1)) * usableWidth
        : paddingX + usableWidth / 2;
    const y =
      chartHeight - paddingY - (t.count / maxTrendValue) * usableHeight;
    return { x, y, ...t };
  });

  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : '';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Command Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="crm-page-title">
              {greeting}, {user?.firstName || 'User'}
            </h1>
            <Badge variant="teal" className="text-[10px] uppercase font-semibold tracking-wider">
              {user?.role || 'Agent'}
            </Badge>
          </div>
          <p className="mt-1 crm-caption flex items-center gap-2">
            <span className="font-medium text-slate-700">{organization?.name || 'Workspace'}</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-crm-teal font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-crm-teal animate-pulse" />
              Live Workspace
            </span>
          </p>
        </div>

        {/* Controls: Timeframe Pills & Action Buttons */}
        <div className="flex flex-col items-start sm:items-end gap-2.5 sm:ml-auto">
          {/* Timeframe Selector Pills & Refresh */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`rounded-md px-2.5 py-1 transition-all ${
                    timeframe === t.id
                      ? 'bg-[#16C1C8] text-[#071A1D] font-bold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Manual Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh dashboard metrics"
              className="h-8 px-2.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-crm-muted ${
                  isFetching ? 'animate-spin text-crm-teal' : ''
                }`}
              />
            </Button>
          </div>

          {/* Quick Actions (Below buttons in this section) */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              isLoading={isExporting}
              className="h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-crm-muted" />
              Export Data
            </Button>

            <Link href="/dashboard/imports">
              <Button variant="outline" size="sm" className="h-8">
                <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-crm-muted" />
                Import CSV
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="h-8 bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] font-semibold shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              New Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>Failed to synchronize dashboard metrics. Please check connection.</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Follow-Up Action Center */}
      <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-crm-border pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-crm-teal">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="crm-card-title">Follow-Up Action Center</h3>
              <p className="crm-caption">Active operational queue</p>
            </div>
          </div>
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-crm-teal hover:text-crm-teal-hover hover:bg-teal-50">
              View All Leads <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Overdue */}
          <Link
            href="/dashboard/leads?preset=overdue"
            className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-100/60 hover:border-rose-300 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <div className="text-xs font-semibold text-rose-900 group-hover:underline flex items-center gap-1">
                  Overdue <ChevronRight className="h-3 w-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-rose-700/80">Immediate attention</div>
              </div>
            </div>
            <div className="text-xl font-bold text-rose-700 font-mono">
              {isLoading ? '...' : (actionItems?.overdueFollowUpsCount ?? 0)}
            </div>
          </Link>

          {/* Due Today */}
          <Link
            href="/dashboard/leads?preset=follow_up_today"
            className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-300 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div>
                <div className="text-xs font-semibold text-amber-900 group-hover:underline flex items-center gap-1">
                  Due Today <ChevronRight className="h-3 w-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-amber-700/80">Today&apos;s schedule</div>
              </div>
            </div>
            <div className="text-xl font-bold text-amber-700 font-mono">
              {isLoading ? '...' : (actionItems?.dueTodayFollowUpsCount ?? 0)}
            </div>
          </Link>

          {/* Upcoming */}
          <Link
            href="/dashboard/leads?preset=upcoming"
            className="flex items-center justify-between p-3 rounded-lg border border-sky-100 bg-sky-50/50 hover:bg-sky-100/60 hover:border-sky-300 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500" />
              <div>
                <div className="text-xs font-semibold text-sky-900 group-hover:underline flex items-center gap-1">
                  Upcoming <ChevronRight className="h-3 w-3 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-sky-700/80">Later this week</div>
              </div>
            </div>
            <div className="text-xl font-bold text-sky-700 font-mono">
              {isLoading ? '...' : (actionItems?.upcomingFollowUpsCount ?? 0)}
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total Leads */}
        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="crm-label">Total Leads</span>
            <div className="rounded-lg bg-teal-50 p-1.5 text-crm-teal">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="crm-metric">
              {isLoading ? '...' : (overview?.totalLeads ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              {(overview?.leadsGrowthRate ?? 0) >= 0 ? (
                <span className="inline-flex items-center font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +{overview?.leadsGrowthRate ?? 0}%
                </span>
              ) : (
                <span className="inline-flex items-center font-semibold text-rose-600">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {overview?.leadsGrowthRate ?? 0}%
                </span>
              )}
              <span className="crm-caption">vs 30d</span>
            </div>
          </div>
        </div>

        {/* Active Pipeline Leads */}
        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="crm-label">In Pipeline</span>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="crm-metric text-sky-950">
              {isLoading ? '...' : (overview?.activeLeads ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="font-semibold text-sky-600 font-mono">
                {overview?.totalLeads
                  ? Math.round(((overview.activeLeads || 0) / overview.totalLeads) * 100)
                  : 0}
                %
              </span>
              <span className="crm-caption">of volume</span>
            </div>
          </div>
        </div>

        {/* Won Leads */}
        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="crm-label">Won Deals</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="crm-metric text-emerald-700">
              {isLoading ? '...' : (overview?.wonLeads ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Closed
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="crm-label">Conversion</span>
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="crm-metric text-indigo-900">
              {isLoading ? '...' : `${overview?.conversionRate ?? 0}%`}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="crm-caption">Win rate</span>
            </div>
          </div>
        </div>

        {/* Duplicate Shield */}
        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm col-span-2 sm:col-span-1 transition-all hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="crm-label">Duplicate Shield</span>
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="crm-metric text-amber-800">
              {isLoading ? '...' : (overview?.duplicateLeadsPrevented ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="crm-caption">Blocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Items & Operational Focus (What Needs Attention Today) */}
      {actionItems && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-4 border-b border-amber-200/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-crm-header">
                Action Items & Operational Focus
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-medium mt-1 sm:mt-0">
              {actionItems.unassignedCount + actionItems.uncontactedCount + actionItems.staleCount}{' '}
              leads requiring attention
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Unassigned Leads Card */}
            <Link
              href="/dashboard/leads"
              className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3.5 hover:border-amber-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-amber-100 p-2 text-amber-700">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Unassigned Leads</div>
                  <div className="text-[11px] text-slate-500">
                    Awaiting sales representative
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-amber-700">
                  {actionItems.unassignedCount}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            {/* Uncontacted New Leads */}
            <Link
              href="/dashboard/leads"
              className="flex items-center justify-between rounded-lg border border-sky-200 bg-white p-3.5 hover:border-sky-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-sky-100 p-2 text-sky-700">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Uncontacted Leads</div>
                  <div className="text-[11px] text-slate-500">
                    In &apos;New&apos; stage awaiting touchpoint
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-sky-700">
                  {actionItems.uncontactedCount}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            {/* Stale Leads */}
            <Link
              href="/dashboard/leads"
              className="flex items-center justify-between rounded-lg border border-rose-200 bg-white p-3.5 hover:border-rose-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-rose-100 p-2 text-rose-700">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Stale Opportunities</div>
                  <div className="text-[11px] text-slate-500">
                    No activity recorded in &gt; 7 days
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-rose-700">
                  {actionItems.staleCount}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 5. Time-Series Lead Trend Visualizer & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Time-Series Lead Acquisition Velocity (Takes 2 columns) */}
        <div className="lg:col-span-2 rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-crm-border">
            <div>
              <h2 className="crm-section-title">
                Intake Velocity Trends
              </h2>
              <p className="crm-caption mt-0.5">
                Lead registrations across timeframe
              </p>
            </div>
            <Badge variant="teal" className="text-[10px] font-semibold">Intake Velocity</Badge>
          </div>

          {isLoading ? (
            <div className="h-44 flex items-center justify-center text-xs text-crm-muted">
              Loading trend analytics...
            </div>
          ) : trends.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-xs text-crm-muted gap-2">
              <span>No time-series lead records found in this window.</span>
              <Button size="sm" variant="outline" onClick={() => setCreateModalOpen(true)}>
                Create First Lead
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Interactive SVG Chart */}
              <div className="relative w-full overflow-hidden rounded-lg bg-slate-50/50 p-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-44 overflow-visible"
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16C1C8" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#22D3DA" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line
                    x1={paddingX}
                    y1={paddingY}
                    x2={chartWidth - paddingX}
                    y2={paddingY}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={paddingX}
                    y1={chartHeight / 2}
                    x2={chartWidth - paddingX}
                    y2={chartHeight / 2}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={paddingX}
                    y1={chartHeight - paddingY}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingY}
                    stroke="#CBD5E1"
                  />

                  {/* Gradient Area */}
                  {areaPath && <path d={areaPath} fill="url(#trendGradient)" />}

                  {/* Trend Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#16C1C8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Vertical Guideline to hovered point */}
                  {hoveredTrendIndex !== null && points[hoveredTrendIndex] && (
                    <line
                      x1={points[hoveredTrendIndex].x}
                      y1={paddingY}
                      x2={points[hoveredTrendIndex].x}
                      y2={chartHeight - paddingY}
                      stroke="#16C1C8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                  )}

                  {/* Interactive Points & Hit Targets */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredTrendIndex === idx;
                    return (
                      <g key={idx} className="cursor-pointer">
                        {/* Hover glow ripple */}
                        {isHovered && (
                          <>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="11"
                              fill="#16C1C8"
                              opacity="0.25"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="6.5"
                              fill="#071A1D"
                              stroke="#16C1C8"
                              strokeWidth="2.5"
                            />
                          </>
                        )}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 4.5 : 3.5}
                          fill={isHovered ? '#16C1C8' : '#FFFFFF'}
                          stroke="#16C1C8"
                          strokeWidth="2"
                          className="transition-all duration-150"
                        />
                        {/* Generous hit target area */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="20"
                          fill="transparent"
                          onMouseEnter={() => setHoveredTrendIndex(idx)}
                          onMouseLeave={() => setHoveredTrendIndex(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Anchored to Exact Hovered Point */}
                {hoveredTrendIndex !== null && points[hoveredTrendIndex] && (() => {
                  const hp = points[hoveredTrendIndex];
                  const xPct = (hp.x / chartWidth) * 100;
                  const yPct = (hp.y / chartHeight) * 100;
                  const isNearTop = yPct < 32;

                  return (
                    <div
                      className="absolute pointer-events-none z-30 transition-all duration-75 ease-out animate-in fade-in zoom-in-95"
                      style={{
                        left: `${xPct}%`,
                        top: `${yPct}%`,
                        transform: `translate(${
                          xPct < 15 ? '0%' : xPct > 85 ? '-100%' : '-50%'
                        }, ${isNearTop ? '14px' : 'calc(-100% - 14px)'})`,
                      }}
                    >
                      <div className="rounded-xl bg-[#071A1D] text-white px-3 py-1.5 shadow-xl border border-[#16C1C8]/50 whitespace-nowrap backdrop-blur-md">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#22D3DA]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#16C1C8] shadow-[0_0_6px_#16C1C8]" />
                          <span>{hp.label}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-200 mt-0.5">
                          <span className="text-sm font-bold text-white font-mono">{hp.count}</span> new leads
                        </div>
                      </div>
                      {/* Down arrow pointing to exact point */}
                      {!isNearTop && (
                        <div
                          className="w-2 h-2 bg-[#071A1D] border-r border-b border-[#16C1C8]/50 transform rotate-45 -mt-1"
                          style={{
                            marginLeft:
                              xPct < 15
                                ? '14px'
                                : xPct > 85
                                ? 'calc(100% - 20px)'
                                : 'calc(50% - 4px)',
                          }}
                        />
                      )}
                      {/* Up arrow if tooltip displayed below point */}
                      {isNearTop && (
                        <div
                          className="w-2 h-2 bg-[#071A1D] border-l border-t border-[#16C1C8]/50 transform rotate-45 -mb-1 absolute top-0 -mt-1"
                          style={{
                            left:
                              xPct < 15
                                ? '14px'
                                : xPct > 85
                                ? 'calc(100% - 20px)'
                                : 'calc(50% - 4px)',
                          }}
                        />
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* X-Axis Date Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono px-2">
                <span>{trends[0]?.label}</span>
                {trends.length > 2 && (
                  <span>{trends[Math.floor(trends.length / 2)]?.label}</span>
                )}
                <span>{trends[trends.length - 1]?.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Stage Funnel (Takes 1 column) */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-crm-border">
              <div>
                <h2 className="crm-section-title">Pipeline Funnel</h2>
                <p className="crm-caption mt-0.5">Stage progression</p>
              </div>
              <Badge variant="teal" className="text-[10px] font-semibold">Real-Time</Badge>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-crm-muted">
                Loading stages...
              </div>
            ) : pipeline.length === 0 ? (
              <div className="py-12 text-center text-xs text-crm-muted">
                No active stages recorded.
              </div>
            ) : (
              <div>
                <div className={`space-y-3.5 ${showAllStages && pipeline.length > 6 ? 'max-h-[380px] overflow-y-auto pr-1' : ''}`}>
                  {visiblePipeline.map((item, idx) => (
                    <div
                      key={item.statusId || idx}
                      className="group rounded-lg p-1.5 -mx-1.5 transition-all hover:bg-teal-50/60 cursor-pointer"
                    >
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-crm-header group-hover:text-crm-teal flex items-center gap-1.5 transition-colors">
                          <span
                            className="h-2 w-2 rounded-full ring-2 ring-transparent group-hover:ring-[#16C1C8]/40 transition-all"
                            style={{ backgroundColor: item.color || '#0D9488' }}
                          />
                          {item.name}
                        </span>
                        <span className="font-mono text-crm-muted group-hover:text-crm-header font-medium transition-colors text-[11px]">
                          <span className="text-crm-header font-bold">{item.count}</span> ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 group-hover:brightness-110 group-hover:shadow-[0_0_8px_rgba(22,193,200,0.6)]"
                          style={{
                            width: `${Math.max(item.percentage, 2)}%`,
                            backgroundColor: item.color || '#0D9488',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {pipeline.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllStages((prev) => !prev)}
                    className="mt-3.5 w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-200 text-xs font-medium text-slate-600 hover:text-crm-teal flex items-center justify-center gap-1.5 transition-all"
                  >
                    {showAllStages ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Show more ({pipeline.length - 6} more stages)</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-crm-muted">Total in Pipeline:</span>
            <span className="font-semibold text-crm-header">
              {overview?.totalLeads ?? 0} leads
            </span>
          </div>
        </div>
      </div>

      {/* 6. Lead Source Attribution & Team Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Attribution */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-crm-border">
            <div>
              <h2 className="crm-section-title">
                Source Attribution
              </h2>
              <p className="crm-caption mt-0.5">
                Acquisition channels
              </p>
            </div>
            <Badge variant="blue" className="text-[10px] font-semibold">Attribution</Badge>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              Loading sources...
            </div>
          ) : sourceAttribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              No lead source records logged.
            </div>
          ) : (
            <div className="space-y-3.5">
              {sourceAttribution.map((src, idx) => (
                <div
                  key={src.name || idx}
                  className="group rounded-lg p-1.5 -mx-1.5 transition-all hover:bg-teal-50/60 cursor-pointer"
                >
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-crm-header group-hover:text-crm-teal transition-colors">
                      {src.name}
                    </span>
                    <span className="font-mono text-crm-muted group-hover:text-crm-header font-medium transition-colors text-[11px]">
                      <span className="text-crm-header font-bold">{src.count}</span> ({src.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-crm-teal transition-all duration-300 group-hover:brightness-110 group-hover:shadow-[0_0_8px_rgba(22,193,200,0.6)]"
                      style={{ width: `${Math.max(src.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Performance Leaderboard */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-crm-border">
            <div>
              <h2 className="crm-section-title">
                Team Performance
              </h2>
              <p className="crm-caption mt-0.5">
                Representative conversion
              </p>
            </div>
            <Badge variant="teal" className="text-[10px] font-semibold">Sales Reps</Badge>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              Loading team metrics...
            </div>
          ) : team.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              No sales team members registered in workspace.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {team.map((member) => (
                <div
                  key={member.userId}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-teal-50 text-crm-teal border border-teal-200 flex items-center justify-center font-bold text-xs">
                      {member.name.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-crm-header">{member.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-crm-header font-mono">
                        {member.assignedCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Assigned</div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-600 font-mono">
                        {member.wonCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Won</div>
                    </div>
                    <Badge variant="teal" className="text-[10px] font-mono">
                      {member.conversionRate}% Win
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7. Recent Leads & Organization Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads Roster */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-crm-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-crm-teal" />
              <h2 className="crm-section-title">Recent Leads</h2>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs font-semibold text-crm-teal hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              Loading recent leads...
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              No leads added yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      {lead.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-crm-header">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{lead.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lead.statusName ? (
                      <Badge
                        variant="default"
                        style={{
                          backgroundColor: `${lead.statusColor || '#0D9488'}15`,
                          color: lead.statusColor || '#0D9488',
                          borderColor: `${lead.statusColor || '#0D9488'}35`,
                        }}
                      >
                        {lead.statusName}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}

                    <Link href={`/dashboard/leads`}>
                      <button
                        title="View in Leads Table"
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

        {/* Real-time Activity Feed */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-crm-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-crm-teal" />
              <h2 className="crm-section-title">
                Recent Activity
              </h2>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs font-semibold text-crm-teal hover:underline flex items-center gap-1"
            >
              Audits <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              Loading recent activities...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-muted">
              No activity recorded yet. Actions like status changes and notes will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-teal-50 text-crm-teal flex items-center justify-center font-bold text-[10px]">
                      {act.user?.firstName ? act.user.firstName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div className="font-semibold text-crm-header">
                        {act.description}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {act.user
                          ? `${act.user.firstName} ${act.user.lastName}`
                          : 'System Ingestion'}
                        {act.lead && (
                          <span className="ml-1 text-crm-muted">
                            • Lead:{' '}
                            <span className="text-slate-700 font-medium">
                              {act.lead.firstName} {act.lead.lastName}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {new Date(act.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Lead Modal */}
      <CreateLeadModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-payload'] });
          toast.success('Lead created and dashboard refreshed');
        }}
        statuses={statuses}
        sources={sources}
        countries={countries}
      />

      {/* Advanced Export Modal */}
      <ExportLeadsModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        sourceContext="dashboard"
      />
    </div>
  );
}
