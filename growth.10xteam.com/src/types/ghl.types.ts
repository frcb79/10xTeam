export interface GhlTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope?: string;
  userType?: "Company" | "Location" | string;
  companyId?: string;
  locationId?: string;
  userId?: string;
  refreshTokenId?: string;
}

export interface GhlOAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope?: string;
  userType?: string;
  companyId?: string;
  locationId?: string;
  userId?: string;
}
