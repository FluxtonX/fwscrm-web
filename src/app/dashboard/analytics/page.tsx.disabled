'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  AlertTriangle,
  Flame,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { fetchDashboard } from '@/features/analytics/api';
import { downloadLeadsCsv } from '@/features/leads/api';

export default function AnalyticsPage() {
  const toast = useToast();
  const [timeframe, setTimeframe] = React.useState('30d');
  const [isExporting, setIsExporting] = React.useState(false);
  const [hoveredTrend, setHoveredTrend] = React.useState<number | null>(null);

  const {
    data: dashboard,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['dashboard-payload', timeframe],
    queryFn: () => fetchDashboard(timeframe),
    staleTime: 1000 * 60 * 2,
  });

  const overview = dashboard?.overview;
  const pipeline = dashboard?.pipeline ?? [];
  const sources = dashboard?.sources ?? [];
  const trends = dashboard?.trends ?? [];
  const team = dashboard?.teamPerformance ?? [];
  const insights = dashboard?.insights ?? [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadLeadsCsv();
      toast.success('Leads intelligence report exported');
    } catch (err: any) {
      toast.error(err?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // SVG Trend Chart
  const maxTrend = Math.max(...trends.map((t) => t.count), 1);
  const chartW = 700;
  const chartH = 180;
  const padX = 24;
  const padY = 24;
  const usableW = chartW - padX * 2;
  const usableH = chartH - padY * 2;

  const points = trends.map((t, idx) => {
    const x =
      trends.length > 1
        ? padX + (idx / (trends.length - 1)) * usableW
        : padX + usableW / 2;
    const y = chartH - padY - (t.count / maxTrend) * usableH;
    return { x, y, ...t };
  });

  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartH - padY} L ${points[0].x} ${chartH - padY} Z`
      : '';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-50 p-2 text-crm-teal">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-crm-header">
                Analytics & Pipeline Intelligence
              </h1>
              <p className="text-xs text-crm-muted">
                Conversion funnels, source attribution, and sales velocity metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
          {/* Timeframe selector */}
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 px-2.5"
            title="Refresh analytics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-crm-teal' : 'text-crm-muted'}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            className="h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-crm-muted" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>Failed to load analytics payload. Please verify your connection.</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted">Conversion Rate</span>
            <div className="rounded-lg bg-teal-50 p-1.5 text-crm-teal">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-crm-header">
            {isLoading ? '...' : `${overview?.conversionRate ?? 0}%`}
          </div>
          <p className="mt-1 text-[11px] text-teal-600 font-medium">Lead to Won deal ratio</p>
        </div>

        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted">Won Deals</span>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700">
            {isLoading ? '...' : (overview?.wonLeads ?? 0).toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Successfully closed deals</p>
        </div>

        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted">Active Pipeline</span>
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-sky-700">
            {isLoading ? '...' : (overview?.activeLeads ?? 0).toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-sky-600 font-medium">In negotiation & qualification</p>
        </div>

        <div className="rounded-xl border border-crm-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted">Period Intake</span>
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-crm-header">
            {isLoading ? '...' : (overview?.leadsThisPeriod ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium">
            {(overview?.leadsGrowthRate ?? 0) >= 0 ? (
              <span className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                +{overview?.leadsGrowthRate ?? 0}%
              </span>
            ) : (
              <span className="flex items-center text-rose-600">
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
                {overview?.leadsGrowthRate ?? 0}%
              </span>
            )}
            <span className="text-slate-400">vs prev</span>
          </div>
        </div>
      </div>

      {/* Smart AI Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs shadow-sm ${
                ins.type === 'positive'
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                  : ins.type === 'warning'
                    ? 'border-amber-200 bg-amber-50/70 text-amber-900'
                    : 'border-sky-200 bg-sky-50/70 text-sky-900'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{ins.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Intake Velocity Trends Chart */}
      <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-crm-border">
          <div>
            <h2 className="text-sm font-bold text-crm-header">Intake Velocity Curve</h2>
            <p className="text-xs text-crm-muted">Lead volume trends across {timeframe}</p>
          </div>
          <Badge variant="teal">Real-time Stream</Badge>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-xs text-crm-muted">
            Loading trend metrics...
          </div>
        ) : trends.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-crm-muted">
            No historical records for this window.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full rounded-lg bg-slate-50/60 p-2 overflow-hidden">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-48 overflow-visible">
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1={padX} y1={padY} x2={chartW - padX} y2={padY} stroke="#E2E8F0" strokeDasharray="4 4" />
                <line x1={padX} y1={chartH / 2} x2={chartW - padX} y2={chartH / 2} stroke="#E2E8F0" strokeDasharray="4 4" />
                <line x1={padX} y1={chartH - padY} x2={chartW - padX} y2={chartH - padY} stroke="#CBD5E1" />

                {areaPath && <path d={areaPath} fill="url(#analyticsGrad)" />}
                {linePath && <path d={linePath} fill="none" stroke="#16C1C8" strokeWidth="2.5" strokeLinecap="round" />}

                {/* Vertical Guideline to hovered point */}
                {hoveredTrend !== null && points[hoveredTrend] && (
                  <line
                    x1={points[hoveredTrend].x}
                    y1={padY}
                    x2={points[hoveredTrend].x}
                    y2={chartH - padY}
                    stroke="#16C1C8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                )}

                {/* Interactive Points */}
                {points.map((p, idx) => {
                  const isHovered = hoveredTrend === idx;
                  return (
                    <g key={idx} className="cursor-pointer">
                      {isHovered && (
                        <>
                          <circle cx={p.x} cy={p.y} r="11" fill="#16C1C8" opacity="0.25" />
                          <circle cx={p.x} cy={p.y} r="6.5" fill="#071A1D" stroke="#16C1C8" strokeWidth="2.5" />
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
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="20"
                        fill="transparent"
                        onMouseEnter={() => setHoveredTrend(idx)}
                        onMouseLeave={() => setHoveredTrend(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip Anchored to Exact Hovered Point */}
              {hoveredTrend !== null && points[hoveredTrend] && (() => {
                const hp = points[hoveredTrend];
                const xPct = (hp.x / chartW) * 100;
                const yPct = (hp.y / chartH) * 100;
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
                        <span className="text-sm font-bold text-white font-mono">{hp.count}</span> leads ingested
                      </div>
                    </div>
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

            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-2">
              <span>{trends[0]?.label}</span>
              {trends.length > 2 && <span>{trends[Math.floor(trends.length / 2)]?.label}</span>}
              <span>{trends[trends.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Pipeline Funnel + Source Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-crm-border">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-crm-teal" />
              <h2 className="text-sm font-bold text-crm-header">Pipeline Stage Conversion</h2>
            </div>
            <Badge variant="teal">Funnel</Badge>
          </div>

          {pipeline.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-muted">No pipeline data recorded.</div>
          ) : (
            <div className="space-y-4">
              {pipeline.map((stage, idx) => (
                <div key={stage.statusId || idx}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-crm-header flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color || '#0D9488' }} />
                      {stage.name}
                    </span>
                    <span className="font-mono text-crm-muted">
                      {stage.count} leads ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(stage.percentage, 3)}%`,
                        backgroundColor: stage.color || '#0D9488',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acquisition Channels */}
        <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-crm-border">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-crm-teal" />
              <h2 className="text-sm font-bold text-crm-header">Lead Acquisition Attribution</h2>
            </div>
            <Badge variant="blue">Marketing</Badge>
          </div>

          {sources.length === 0 ? (
            <div className="py-8 text-center text-xs text-crm-muted">No sources logged.</div>
          ) : (
            <div className="space-y-4">
              {sources.map((src, idx) => (
                <div key={src.name || idx}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-crm-header">{src.name}</span>
                    <span className="font-mono text-crm-muted">
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-crm-teal transition-all duration-300"
                      style={{ width: `${Math.max(src.percentage, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Productivity Leaderboard */}
      <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-crm-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-crm-teal" />
            <h2 className="text-sm font-bold text-crm-header">Sales Representative Leaderboard</h2>
          </div>
          <Link href="/dashboard/users" className="text-xs text-crm-teal hover:underline font-semibold">
            Manage Team &rarr;
          </Link>
        </div>

        {team.length === 0 ? (
          <div className="py-8 text-center text-xs text-crm-muted">No sales representatives registered.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {team.map((member) => (
              <div key={member.userId} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-teal-50 text-crm-teal border border-teal-200 flex items-center justify-center font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-crm-header">{member.name}</div>
                    <div className="text-[11px] text-slate-400">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-bold text-crm-header">{member.assignedCount}</div>
                    <div className="text-[10px] text-slate-400">Assigned</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600">{member.wonCount}</div>
                    <div className="text-[10px] text-slate-400">Won</div>
                  </div>
                  <Badge variant="teal" className="text-[10px]">
                    {member.conversionRate}% Conversion
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
