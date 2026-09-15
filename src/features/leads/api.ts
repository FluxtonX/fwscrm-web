import { apiClient, API_BASE_URL } from '@/lib/api/client';
import {
  Lead,
  LeadStatus,
  LeadSource,
  Country,
  PaginatedLeadsResponse,
  QueryLeadsParams,
  CreateLeadInput,
  LeadActivity,
  LeadNote,
} from './types';

export async function fetchLeads(params: QueryLeadsParams = {}): Promise<PaginatedLeadsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.country) query.set('country', params.country);
  if (params.leadSource) query.set('leadSource', params.leadSource);
  if (params.ownerId) query.set('ownerId', params.ownerId);
  if (params.sort) query.set('sort', params.sort);
  if (params.order) query.set('order', params.order);

  const qs = query.toString();
  return apiClient<PaginatedLeadsResponse>(`/leads${qs ? `?${qs}` : ''}`);
}

export async function fetchLead(id: string): Promise<Lead> {
  return apiClient<Lead>(`/leads/${id}`);
}

export async function createLead(data: CreateLeadInput): Promise<Lead> {
  return apiClient<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLead(id: string, data: Partial<CreateLeadInput>): Promise<Lead> {
  return apiClient<Lead>(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/leads/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkAssignLeads(leadIds: string[], ownerId: string): Promise<{ count: number }> {
  return apiClient<{ count: number }>('/leads/bulk/assign', {
    method: 'POST',
    body: JSON.stringify({ leadIds, ownerId }),
  });
}

export async function bulkUpdateStatus(leadIds: string[], statusId: string): Promise<{ count: number }> {
  return apiClient<{ count: number }>('/leads/bulk/status', {
    method: 'POST',
    body: JSON.stringify({ leadIds, statusId }),
  });
}

export async function bulkDeleteLeads(leadIds: string[]): Promise<{ count: number }> {
  return apiClient<{ count: number }>('/leads/bulk/delete', {
    method: 'POST',
    body: JSON.stringify({ leadIds }),
  });
}

export async function fetchLeadStatuses(): Promise<LeadStatus[]> {
  return apiClient<LeadStatus[]>('/leads/meta/statuses');
}

export async function fetchLeadSources(): Promise<LeadSource[]> {
  return apiClient<LeadSource[]>('/leads/meta/sources');
}

export async function fetchCountries(): Promise<Country[]> {
  return apiClient<Country[]>('/leads/meta/countries');
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export async function fetchUsers(): Promise<UserItem[]> {
  return apiClient<UserItem[]>('/users');
}

// Phase 7: Activities & Notes API functions
export async function fetchLeadActivities(leadId: string): Promise<LeadActivity[]> {
  return apiClient<LeadActivity[]>(`/leads/${leadId}/activities`);
}

export async function fetchLeadNotes(leadId: string): Promise<LeadNote[]> {
  return apiClient<LeadNote[]>(`/leads/${leadId}/notes`);
}

export async function createLeadNote(leadId: string, content: string): Promise<LeadNote> {
  return apiClient<LeadNote>(`/leads/${leadId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function updateLeadNote(leadId: string, noteId: string, content: string): Promise<LeadNote> {
  return apiClient<LeadNote>(`/leads/${leadId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export async function deleteLeadNote(leadId: string, noteId: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/leads/${leadId}/notes/${noteId}`, {
    method: 'DELETE',
  });
}

// Phase 9: Streaming CSV Export
export async function downloadLeadsCsv(params: QueryLeadsParams = {}): Promise<void> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.country) query.set('country', params.country);
  if (params.leadSource) query.set('leadSource', params.leadSource);
  if (params.ownerId) query.set('ownerId', params.ownerId);

  const qs = query.toString();
  const res = await fetch(`${API_BASE_URL}/leads/export${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to export leads');
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}

export async function downloadSelectedLeadsCsv(leadIds: string[]): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/leads/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ leadIds }),
  });
  if (!res.ok) throw new Error('Failed to export selected leads');
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `leads_export_selected_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}
