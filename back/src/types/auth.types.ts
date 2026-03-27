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
