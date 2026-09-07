'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLead } from '../api';
import { LeadStatus, LeadSource, Country } from '../types';
import { useToast } from '@/components/ui/toast';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  country: z.string().optional(),
  leadSource: z.string().optional(),
  referrer: z.string().optional(),
  tag1: z.string().optional(),
  statusId: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  statuses: LeadStatus[];
  sources: LeadSource[];
  countries: Country[];
}

export function CreateLeadModal({
  open,
  onOpenChange,
  onSuccess,
  statuses,
  sources,
  countries,
}: CreateLeadModalProps) {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      await createLead({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        country: data.country || undefined,
        leadSource: data.leadSource || undefined,
        referrer: data.referrer || undefined,
        tag1: data.tag1 || undefined,
        statusId: data.statusId || undefined,
      });

      toast.success(`Lead for ${data.firstName} ${data.lastName} created`);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create lead');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Add New Lead</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              First Name *
            </label>
            <Input
              placeholder="Donald"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Last Name *
            </label>
            <Input
              placeholder="Hamerton"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Email *
            </label>
            <Input
              type="email"
              placeholder="donald@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Phone
            </label>
            <Input
              placeholder="6725136550"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Country
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
              {...register('country')}
            >
              <option value="">Select country...</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Lead Source
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
              {...register('leadSource')}
            >
              <option value="">Select source...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Status
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-crm-border bg-white px-3 py-1.5 text-xs text-crm-text shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-primary"
              {...register('statusId')}
            >
              <option value="">Default status...</option>
              {statuses.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Referrer
            </label>
            <Input placeholder="Sub-affiliate" {...register('referrer')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-crm-text mb-1">
              Tag 1
            </label>
            <Input placeholder="Tag" {...register('tag1')} />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Lead
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
