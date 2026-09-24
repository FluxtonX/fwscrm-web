import { apiClient } from '@/lib/api/client';
import {
  InvitationItem,
  CreateInvitationInput,
  CreateInvitationResponse,
  ValidateInvitationResponse,
  AcceptInvitationInput,
} from './types';

export async function createInvitation(
  input: CreateInvitationInput,
): Promise<CreateInvitationResponse> {
  return apiClient<CreateInvitationResponse>('/invitations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listPendingInvitations(): Promise<InvitationItem[]> {
  return apiClient<InvitationItem[]>('/invitations');
}

export async function resendInvitation(
  id: string,
): Promise<CreateInvitationResponse> {
  return apiClient<CreateInvitationResponse>(`/invitations/${id}/resend`, {
    method: 'POST',
  });
}

export async function revokeInvitation(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(
    `/invitations/${id}/revoke`,
    {
      method: 'POST',
    },
  );
}

export async function validateInvitationToken(
  token: string,
): Promise<ValidateInvitationResponse> {
  return apiClient<ValidateInvitationResponse>(
    `/invitations/validate?token=${encodeURIComponent(token)}`,
  );
}

export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<{ user: any; organization: any; token: string }> {
  return apiClient<{ user: any; organization: any; token: string }>(
    '/invitations/accept',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}
