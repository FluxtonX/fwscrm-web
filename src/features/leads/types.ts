export interface LeadStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  isoCode: string | null;
}

export interface LeadUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface LeadActivity {
  id: string;
  organizationId: string;
  leadId: string;
  userId?: string | null;
  type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'OWNER_ASSIGNED' | 'NOTE_ADDED' | 'IMPORTED' | 'DELETED';
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: LeadUser | null;
  lead?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface LeadNote {
  id: string;
  organizationId: string;
  leadId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: LeadUser;
}

export interface Lead {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  countryId?: string | null;
  countryName?: string | null;
  statusId?: string | null;
  status?: LeadStatus | null;
  sourceId?: string | null;
  sourceName?: string | null;
  source?: LeadSource | null;
  subAffiliateId?: string | null;
  referrer?: string | null;
  tag1?: string | null;
  ownerId?: string | null;
  owner?: LeadUser | null;
  notes?: LeadNote[];
  activities?: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedLeadsResponse {
  data: Lead[];
  meta: PaginationMeta;
}

export interface QueryLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  country?: string;
  leadSource?: string;
  ownerId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  countryId?: string;
  leadSource?: string;
  sourceId?: string;
  referrer?: string;
  tag1?: string;
  statusId?: string;
  ownerId?: string;
}
