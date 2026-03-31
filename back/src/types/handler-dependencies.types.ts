import { Response } from 'express';

import {
  AccessTokenPayload,
  RefreshSessionRecord,
  RefreshTokenPayload,
  UserRecord,
  VerificationMessageParams,
} from './auth.types';

export type SharedHandlerDependencies = {
  usersStore: UserRecord[];
  refreshSessionsStore: RefreshSessionRecord[];
  normalizeEmail: (email: string | undefined) => string;
  isValidEmail: (email: string) => boolean;
  cryptoRandomId: () => string;
};

export type RegisterHandlerDependencies = SharedHandlerDependencies & {
  createVerificationCode: () => string;
  cryptoRandomId: () => string;
  logVerificationMessage: (params: VerificationMessageParams) => void;
};

export type VerifyEmailHandlerDependencies = SharedHandlerDependencies;

export type ResendCodeHandlerDependencies = SharedHandlerDependencies & {
  createVerificationCode: () => string;
  logVerificationMessage: (params: VerificationMessageParams) => void;
};

export type LoginHandlerDependencies = SharedHandlerDependencies & {
  createAccessToken: (params: { userId: string; email: string }) => string;
  createRefreshToken: (params: { userId: string; sessionId: string }) => string;
  accessTokenTtlMs: number;
  refreshTokenTtlMs: number;
  setRefreshTokenCookie: (params: { token: string; res: Response }) => void;
};

export type RefreshHandlerDependencies = SharedHandlerDependencies & {
  clearRefreshTokenCookie: (res: Response) => void;
  createAccessToken: (params: { userId: string; email: string }) => string;
  createRefreshToken: (params: { userId: string; sessionId: string }) => string;
  readRefreshTokenFromRequest: (params: { headers: Record<string, string | string[] | undefined> }) => string;
  refreshTokenTtlMs: number;
  setRefreshTokenCookie: (params: { token: string; res: Response }) => void;
  verifyRefreshToken: (token: string) => RefreshTokenPayload | null;
};

export type MeHandlerDependencies = SharedHandlerDependencies & {
  readAccessTokenFromRequest: (params: { headers: Record<string, string | string[] | undefined> }) => string;
  verifyAccessToken: (token: string) => AccessTokenPayload | null;
};

export type LogoutHandlerDependencies = SharedHandlerDependencies & {
  clearRefreshTokenCookie: (res: Response) => void;
  readRefreshTokenFromRequest: (params: { headers: Record<string, string | string[] | undefined> }) => string;
  verifyRefreshToken: (token: string) => RefreshTokenPayload | null;
};
