'use client';

import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Calendar, Mail, User, Building } from 'lucide-react';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [teamSize, setTeamSize] = useState('10-50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !workEmail) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setSubmitted(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="crm-card-title text-xl font-bold text-[#071A1D] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-crm-teal" />
            Schedule a Live Platform Demo
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-crm-teal">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="crm-card-title text-lg font-bold text-[#071A1D]">Demo Request Received</h3>
            <p className="text-sm text-crm-muted max-w-xs mx-auto">
              Thank you, <span className="font-semibold text-slate-800">{fullName}</span>. An enterprise solution architect will reach out to <span className="font-semibold text-slate-800">{workEmail}</span> shortly.
            </p>
            <div className="pt-4">
              <Button onClick={handleClose} className="w-full bg-crm-teal hover:bg-crm-teal-hover">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <p className="crm-caption text-crm-muted">
              See how FWS CRM orchestrates high-volume lead ingestion, streaming CSV processing, and pipeline tracking.
            </p>
            <div>
              <label className="crm-label block mb-1 text-[#071A1D]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="crm-label block mb-1 text-[#071A1D]">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  required
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="crm-label block mb-1 text-[#071A1D]">Company</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="crm-label block mb-1 text-[#071A1D]">Team Size</label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full rounded-md border border-crm-border bg-white px-3 py-2 text-sm text-crm-text focus:border-crm-teal focus:outline-none focus:ring-1 focus:ring-crm-teal"
                >
                  <option value="1-10">1-10 agents</option>
                  <option value="10-50">10-50 agents</option>
                  <option value="50-250">50-250 agents</option>
                  <option value="250+">250+ enterprise</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-crm-teal hover:bg-crm-teal-hover text-white">
                Request Demo
              </Button>
            </DialogFooter>
          </form>
        )}
      </div>
    </Dialog>
  );
}
