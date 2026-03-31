import express from 'express';

import { createLoginHandler } from './handlers/loginHandler';
import { createLogoutHandler } from './handlers/logoutHandler';
import { createMeHandler } from './handlers/meHandler';
import { createRegisterHandler } from './handlers/registerHandler';
import { createRefreshHandler } from './handlers/refreshHandler';
import { createResendCodeHandler } from './handlers/resendCodeHandler';
import { createVerifyEmailHandler } from './handlers/verifyEmailHandler';
import { RefreshSessionRecord, UserRecord, VerificationMessageParams } from './types/auth.types';
import { readAccessTokenFromRequest } from './utils/access-token';
import {
  clearRefreshTokenCookie,
  readRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from './utils/cookies';
import { createJwtAuthService } from './utils/jwt';

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
const allowedClientOrigins = createAllowedClientOrigins(clientBaseUrl);
const usersStore: UserRecord[] = [];
const refreshSessionsStore: RefreshSessionRecord[] = [];
const accessTokenTtlSeconds = Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 15;
const refreshTokenTtlSeconds = Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 60 * 60 * 24;
const refreshTokenTtlMs = refreshTokenTtlSeconds * 1000;
const jwtAuthService = createJwtAuthService({
  accessSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me',
  accessTokenTtlSeconds,
  refreshTokenTtlSeconds,
});

app.use(express.json());

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedClientOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Auth training backend is running',
    availableRoutes: [
      'POST /auth/register',
      'POST /auth/login',
      'POST /auth/verify-email',
      'POST /auth/resend-code',
      'POST /auth/refresh',
      'GET /auth/me',
      'POST /auth/logout',
    ],
    tokenLifetimes: {
      accessTokenSeconds: accessTokenTtlSeconds,
      refreshTokenSeconds: refreshTokenTtlSeconds,
    },
  });
});

app.post(
  '/auth/register',
  createRegisterHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    createVerificationCode,
    cryptoRandomId,
    logVerificationMessage,
  }),
);

app.post(
  '/auth/verify-email',
  createVerifyEmailHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    cryptoRandomId,
  }),
);

app.post(
  '/auth/resend-code',
  createResendCodeHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    cryptoRandomId,
    createVerificationCode,
    logVerificationMessage,
  }),
);

app.post(
  '/auth/login',
  createLoginHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    cryptoRandomId,
    createAccessToken: jwtAuthService.createAccessToken,
    createRefreshToken: jwtAuthService.createRefreshToken,
    accessTokenTtlMs: accessTokenTtlSeconds * 1000,
    refreshTokenTtlMs,
    setRefreshTokenCookie: ({ token, res }) =>
      setRefreshTokenCookie({ token, res, maxAgeMs: refreshTokenTtlMs }),
  }),
);

app.post(
  '/auth/refresh',
  createRefreshHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    cryptoRandomId,
    clearRefreshTokenCookie,
    createAccessToken: jwtAuthService.createAccessToken,
    createRefreshToken: jwtAuthService.createRefreshToken,
    readRefreshTokenFromRequest,
    refreshTokenTtlMs,
    setRefreshTokenCookie: ({ token, res }) =>
      setRefreshTokenCookie({ token, res, maxAgeMs: refreshTokenTtlMs }),
    verifyRefreshToken: jwtAuthService.verifyRefreshToken,
  }),
);

app.get(
  '/auth/me',
  createMeHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    cryptoRandomId,
    readAccessTokenFromRequest,
    verifyAccessToken: jwtAuthService.verifyAccessToken,
  }),
);

app.post(
  '/auth/logout',
  createLogoutHandler({
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    cryptoRandomId,
    clearRefreshTokenCookie,
    readRefreshTokenFromRequest,
    verifyRefreshToken: jwtAuthService.verifyRefreshToken,
  }),
);

app.listen(port, () => {
  console.log(`Auth backend started on port ${port}`);
});

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function createVerificationCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function cryptoRandomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildVerificationLink(email: string, code: string) {
  const url = new URL('/verify-email', clientBaseUrl);
  url.searchParams.set('email', email);
  url.searchParams.set('code', code);
  return url.toString();
}

function logVerificationMessage(params: VerificationMessageParams) {
  const verificationLink = buildVerificationLink(params.email, params.code);

  console.log('');
  console.log('=== SMTP Mock Adapter ===');
  console.log(`Reason: ${params.reason}`);
  console.log(`To: ${params.email}`);
  console.log(`Code: ${params.code}`);
  console.log(`Verification link: ${verificationLink}`);
  console.log('=========================');
  console.log('');
}

function createAllowedClientOrigins(primaryClientUrl: string) {
  const origins = new Set<string>([
    primaryClientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]);

  return Array.from(origins);
}
