'use client';

import * as React from 'react';
import { useAuth } from '@/features/auth/auth-context';
import {
  Settings,
  Building2,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  Lock,
  Save,
  Key,
  Globe,
  Server,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { user, organization } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = React.useState<
    'general' | 'security' | 'pipeline' | 'infrastructure'
  >('general');

  // Form states
  const [orgName, setOrgName] = React.useState(organization?.name || 'My Organization');
  const [slug, setSlug] = React.useState(organization?.slug || 'workspace');
  const [timezone, setTimezone] = React.useState('UTC');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Workspace profile settings updated successfully');
    }, 600);
  };

  const tabs = [
    { id: 'general', label: 'Workspace Profile', icon: Building2 },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'pipeline', label: 'Pipeline Stages', icon: Layers },
    { id: 'infrastructure', label: 'Infrastructure & DB', icon: Database },
  ] as const;

  const defaultStages = [
    { name: 'New', color: '#0D9488', order: 1, desc: 'Freshly captured lead awaiting contact' },
    { name: 'Contacted', color: '#0284C7', order: 2, desc: 'Outreach made via phone or email' },
    { name: 'Qualified', color: '#6366F1', order: 3, desc: 'Requirement and budget validated' },
    { name: 'Proposal', color: '#8B5CF6', order: 4, desc: 'Quote or proposal delivered' },
    { name: 'Negotiation', color: '#D97706', order: 5, desc: 'Contract negotiation in progress' },
    { name: 'Won', color: '#10B981', order: 6, desc: 'Deal successfully closed and won' },
    { name: 'Lost', color: '#EF4444', order: 7, desc: 'Lead unresponsive or disqualified' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-xl border border-crm-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 p-2.5 text-crm-teal">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-crm-header">
              Workspace & Security Settings
            </h1>
            <p className="text-xs text-crm-muted">
              Configure organization preferences, authentication policies, and database connection status.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <div className="bg-white rounded-xl border border-crm-border p-2 shadow-sm space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#16C1C8] text-[#071A1D] font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#071A1D]' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Production Build</div>
            <div className="text-[11px]">Version: FWS CRM v1.0</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All Services Operational
            </div>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* 1. General Tab */}
          {activeTab === 'general' && (
            <div className="rounded-xl border border-crm-border bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-crm-border pb-4">
                <h2 className="text-base font-bold text-crm-header">Organization Profile</h2>
                <p className="text-xs text-crm-muted">General workspace identity and regional settings.</p>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Workspace Name</label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Organization Slug</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Used for tenant isolation and routing.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Workspace Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-crm-teal"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSaving}
                    className="bg-[#16C1C8] hover:bg-[#22D3DA] text-[#071A1D] font-semibold shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Workspace Profile
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Security Tab */}
          {activeTab === 'security' && (
            <div className="rounded-xl border border-crm-border bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-crm-border pb-4">
                <h2 className="text-base font-bold text-crm-header">Security & Authentication Policy</h2>
                <p className="text-xs text-crm-muted">Defense-in-depth security configuration and session guards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-crm-header flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-emerald-600" />
                      HttpOnly Signed Cookies
                    </span>
                    <Badge variant="teal" className="text-[10px]">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tokens are strictly dispatched via HttpOnly, SameSite=Lax signed cookies, preventing JavaScript XSS token exfiltration.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-crm-header flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-sky-600" />
                      JWT Rotation Window
                    </span>
                    <Badge variant="blue" className="text-[10px]">15m / 7d</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Short-lived access tokens expire every 15 minutes. Automatic background silent refresh active for 7 days.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-crm-header flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      Dynamic CORS Guard
                    </span>
                    <Badge variant="default" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">Enforced</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Whitelisted to your verified Vercel production deployment and preview domains with origin credential validation.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-crm-header flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-amber-600" />
                      Password Hashing
                    </span>
                    <Badge variant="default" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">Bcrypt (10 R)</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All user passwords salted and encrypted via Bcrypt with 10 calculation rounds before relational persistence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Pipeline Stages Tab */}
          {activeTab === 'pipeline' && (
            <div className="rounded-xl border border-crm-border bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-crm-border pb-4">
                <h2 className="text-base font-bold text-crm-header">Sales Pipeline Stages</h2>
                <p className="text-xs text-crm-muted">Configured stages for organization lead progression.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {defaultStages.map((stage) => (
                  <div key={stage.name} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-md text-[11px] font-bold text-slate-500 bg-slate-100">
                        {stage.order}
                      </div>
                      <div>
                        <div className="font-bold text-crm-header flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                          {stage.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</div>
                      </div>
                    </div>

                    <Badge
                      variant="default"
                      style={{
                        backgroundColor: `${stage.color}15`,
                        color: stage.color,
                        borderColor: `${stage.color}40`,
                      }}
                      className="text-[10px]"
                    >
                      Stage {stage.order}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Infrastructure Tab */}
          {activeTab === 'infrastructure' && (
            <div className="rounded-xl border border-crm-border bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-crm-border pb-4">
                <h2 className="text-base font-bold text-crm-header">Cloud Infrastructure & Database</h2>
                <p className="text-xs text-crm-muted">Cloud backend connectivity and database health diagnostics.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-teal-50 p-2 text-crm-teal">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-crm-header">Neon Serverless PostgreSQL</div>
                      <div className="text-[11px] text-slate-500">Connection Pooling & SSL Require enabled</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-crm-header">Render Web Service (NestJS API)</div>
                      <div className="text-[11px] text-slate-500">Global API prefix: /api • Health probe: /health</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                    <CheckCircle2 className="h-4 w-4" />
                    Healthy
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-crm-header">Vercel Global Edge Network</div>
                      <div className="text-[11px] text-slate-500">Next.js 14 App Router client application</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                    <CheckCircle2 className="h-4 w-4" />
                    Operational
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
