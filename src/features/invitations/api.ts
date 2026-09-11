import { apiClient } from '@/lib/api/client';
import {
  ValidatedInvitation,
  AcceptInvitationPayload,
  AcceptInvitationResponse,
} from './types';

export async function validateInvitationToken(
  token: string,
): Promise<ValidatedInvitation> {
  return apiClient<ValidatedInvitation>(
    `/invitations/validate?token=${encodeURIComponent(token)}`,
  );
}

export async function acceptInvitation(
  payload: AcceptInvitationPayload,
): Promise<AcceptInvitationResponse> {
  return apiClient<AcceptInvitationResponse>('/invitations/accept', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
