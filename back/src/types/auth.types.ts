export type VerificationReason = 'register' | 'resend-code';

export type VerificationMessageParams = {
  email: string;
  code: string;
  reason: VerificationReason;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  verificationCode: string;
  isEmailVerified: boolean;
};

export type RefreshSessionRecord = {
  id: string;
  userId: string;
  expiresAt: number;
  isRevoked: boolean;
  replacedBySessionId: string | null;
};

export type JwtTokenType = 'access' | 'refresh';

export type BaseJwtPayload = {
  sub: string;
  type: JwtTokenType;
  iat: number;
  exp: number;
};

export type AccessTokenPayload = BaseJwtPayload & {
  type: 'access';
  email: string;
};

export type RefreshTokenPayload = BaseJwtPayload & {
  type: 'refresh';
  sessionId: string;
};

export type RegisterBody = {
  email?: string;
  password?: string;
};

export type VerifyEmailBody = {
  email?: string;
  code?: string;
};

export type ResendCodeBody = {
  email?: string;
};

export type LoginBody = {
  email?: string;
  password?: string;
};

export type AuthenticatedUserResponse = {
  id: string;
  email: string;
};

export type LoginSuccessResponse = {
  message: string;
  accessToken: string;
  user: AuthenticatedUserResponse;
};
