import express from 'express';

import { createRegisterHandler } from './handlers/registerHandler';
import { createResendCodeHandler } from './handlers/resendCodeHandler';
import { createVerifyEmailHandler } from './handlers/verifyEmailHandler';
import { UserRecord, VerificationMessageParams } from './types/auth.types';

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
const usersStore: UserRecord[] = [];

app.use(express.json());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
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
      'POST /auth/verify-email',
      'POST /auth/resend-code',
    ],
  });
});

app.post(
  '/auth/register',
  createRegisterHandler({
    usersStore,
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
    normalizeEmail,
    isValidEmail,
  }),
);

app.post(
  '/auth/resend-code',
  createResendCodeHandler({
    usersStore,
    normalizeEmail,
    isValidEmail,
    createVerificationCode,
    logVerificationMessage,
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
