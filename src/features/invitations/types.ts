export interface ValidatedInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AcceptInvitationPayload {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AcceptInvitationResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  message: string;
}
