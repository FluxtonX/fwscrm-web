'use client';

import * as React from 'react';
import { Search, Filter, SlidersHorizontal, UserCheck, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LeadManagementPreview() {
  const leads = [
    {
      id: '1',
      name: 'Alexander Wright',
      initials: 'AW',
      email: 'alex.wright@apexgroup.ca',
      company: 'Apex Global Group',
      country: 'Canada',
      status: 'Qualified',
      statusColor: 'bg-sky-50 text-sky-700 border-sky-200',
      owner: 'Sarah Jenkins',
      ownerInitials: 'SJ',
      value: '$48,000',
      lastActivity: 'Call note logged • 12m ago',
    },
    {
      id: '2',
      name: 'Sophia Chen',
      initials: 'SC',
      email: 'sophia.chen@nexusmedia.io',
      company: 'Nexus Media Inc.',
      country: 'United States',
      status: 'Proposal',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      owner: 'Elena Rostova',
      ownerInitials: 'ER',
      value: '$65,000',
      lastActivity: 'Contract sent • 1h ago',
    },
    {
      id: '3',
      name: 'Marcus Vance',
      initials: 'MV',
      email: 'm.vance@vanceholdings.co.uk',
      company: 'Vance Holdings Ltd',
      country: 'United Kingdom',
      status: 'Negotiation',
      statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      owner: 'Marcus Sterling',
      ownerInitials: 'MS',
      value: '$92,000',
      lastActivity: 'Stage updated • 3h ago',
    },
    {
      id: '4',
      name: 'Liam Gallagher',
      initials: 'LG',
      email: 'liam.g@solsticebio.com',
      company: 'Solstice Therapeutics',
      country: 'Ireland',
      status: 'Won',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      owner: 'David Miller',
      ownerInitials: 'DM',
      value: '$118,000',
      lastActivity: 'Closed deal • Yesterday',
    },
    {
      id: '5',
      name: 'Freja Lindqvist',
      initials: 'FL',
      email: 'freja@nordicquant.se',
      company: 'Nordic Quant Tech',
      country: 'Sweden',
      status: 'New',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      owner: 'Sarah Jenkins',
      ownerInitials: 'SJ',
      value: '$24,000',
      lastActivity: 'CSV Ingested • 2h ago',
    },
  ];

  return (
    <section id="leads" className="py-20 bg-white border-b border-[#E1EBEB] text-[#071A1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
              <UserCheck className="h-3.5 w-3.5" /> Lead Management
            </div>
            <h2 className="crm-section-title text-[#071A1D]">
              Authoritative customer records.
            </h2>
            <p className="crm-body mt-2 text-[#4A6B6F] max-w-xl">
              Unified contact history, deal valuations, territory tags, and chronological touchpoint tracking.
            </p>
          </div>

          <Link href="/register" className="inline-flex items-center text-xs font-semibold text-[#0D7F84] hover:text-[#16C1C8] gap-1">
            Explore CRM Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* CRM Miniature Table Container */}
        <div className="rounded-2xl border border-[#E1EBEB] bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
          {/* Mock Search & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EAEFF0]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#4A6B6F]" />
              <input
                type="text"
                readOnly
                placeholder="Search leads by name, company, email..."
                value=""
                className="h-8 w-full rounded-lg border border-[#E1EBEB] bg-[#F8FAFA] pl-9 pr-3 text-xs text-slate-800 placeholder:text-[#4A6B6F] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1EBEB] bg-[#F8FAFA] text-slate-700 font-medium">
                <Filter className="h-3.5 w-3.5 text-[#0D7F84]" />
                <span>All Statuses</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1EBEB] bg-[#F8FAFA] text-slate-700 font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>All Owners</span>
              </div>
              <span className="text-[11px] font-mono text-[#0D7F84] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded font-semibold">
                1,040 Total Leads
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#E1EBEB] text-[#4A6B6F] select-none">
                  <th className="crm-label pb-3 pl-2">Lead Name</th>
                  <th className="crm-label pb-3">Company</th>
                  <th className="crm-label pb-3">Status</th>
                  <th className="crm-label pb-3">Owner</th>
                  <th className="crm-label pb-3">Deal Value</th>
                  <th className="crm-label pb-3 pr-2">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFF0]">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#F8FAFA] transition-colors"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-[10px] text-[#0D7F84]">
                          {lead.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[#071A1D]">{lead.name}</div>
                          <div className="text-[10px] text-[#4A6B6F]">{lead.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company & Country */}
                    <td className="py-3">
                      <div className="text-[#071A1D] font-medium">{lead.company}</div>
                      <div className="text-[10px] text-[#4A6B6F]">{lead.country}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${lead.statusColor}`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                          {lead.ownerInitials}
                        </span>
                        <span className="text-slate-700 font-medium">{lead.owner}</span>
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-3">
                      <span className="font-semibold text-[#0D7F84] font-mono">{lead.value}</span>
                    </td>

                    {/* Last Activity */}
                    <td className="py-3 pr-2">
                      <div className="text-[11px] text-[#4A6B6F] flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{lead.lastActivity}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
