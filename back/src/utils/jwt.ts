import crypto from 'crypto';

import {
  AccessTokenPayload,
  BaseJwtPayload,
  RefreshTokenPayload,
} from '../types/auth.types';

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function signValue(value: string, secret: string) {
  return toBase64Url(crypto.createHmac('sha256', secret).update(value).digest());
}

function createJwt<TPayload extends BaseJwtPayload>(payload: TPayload, secret: string) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt<TPayload extends BaseJwtPayload>(token: string, secret: string): TPayload | null {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = signValue(`${encodedHeader}.${encodedPayload}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as TPayload;

    if (!payload?.sub || !payload?.type || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createJwtAuthService(params: {
  accessSecret: string;
  refreshSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}) {
  return {
    createAccessToken(input: { userId: string; email: string }) {
      const issuedAt = Math.floor(Date.now() / 1000);

      return createJwt<AccessTokenPayload>(
        {
          sub: input.userId,
          email: input.email,
          type: 'access',
          iat: issuedAt,
          exp: issuedAt + params.accessTokenTtlSeconds,
        },
        params.accessSecret,
      );
    },

    verifyAccessToken(token: string) {
      const payload = verifyJwt<AccessTokenPayload>(token, params.accessSecret);

      if (!payload || payload.type !== 'access') {
        return null;
      }

      return payload;
    },

    createRefreshToken(input: { userId: string; sessionId: string }) {
      const issuedAt = Math.floor(Date.now() / 1000);

      return createJwt<RefreshTokenPayload>(
        {
          sub: input.userId,
          sessionId: input.sessionId,
          type: 'refresh',
          iat: issuedAt,
          exp: issuedAt + params.refreshTokenTtlSeconds,
        },
        params.refreshSecret,
      );
    },

    verifyRefreshToken(token: string) {
      const payload = verifyJwt<RefreshTokenPayload>(token, params.refreshSecret);

      if (!payload || payload.type !== 'refresh') {
        return null;
      }

      return payload;
    },
  };
}
